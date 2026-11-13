import type {
  CloudSyncAdapters,
  BatchSyncResult,
  CloudSyncStatus,
  CloudWardrobeItem,
  FailedSyncRecord,
  FirebaseAuthUserLike,
  LocalWardrobeItem,
  SyncUserScope,
} from '../types/cloudSync.js';

export const DEFAULT_UPLOAD_CONCURRENCY = 5;
export const FIRESTORE_BATCH_MAX_OPS = 400;
export const FIRESTORE_SAFE_DOC_BYTES = 900 * 1024;

/** Return true if a string is an inline base64 data URI rather than a compact URL. */
export function isInlineBase64DataUrl(value?: string | null): boolean {
  return typeof value === 'string' && /^\s*data:/i.test(value);
}

/** Measure serialized UTF-8 byte length of a Firestore payload before committing. */
export function measureJsonUtf8Bytes(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

/**
 * Derive userId and vault scope so authenticated accounts scope by uid while
 * anonymous Phone/PC sessions sharing a Private Sync Vault Key see the same feed.
 */
export function resolveSyncUserScope(
  authUser: FirebaseAuthUserLike | null | undefined,
  vaultKey: string
): SyncUserScope {
  const cleanVault = (vaultKey || '').trim() || 'default-vault';
  const authUid = authUser?.uid || null;
  const userId = authUser && !authUser.isAnonymous && authUid ? authUid : cleanVault;
  return { userId, authUid, vaultKey: cleanVault };
}

/** Guard ensuring no raw base64 data URI can enter a Firestore document write. */
export function sanitizeItemForFirestore(
  item: LocalWardrobeItem,
  scope: SyncUserScope,
  timestamp: number
): CloudWardrobeItem {
  const candidateUrl = item.imageUrl || (!isInlineBase64DataUrl(item.image) ? item.image || null : null);
  if (isInlineBase64DataUrl(candidateUrl) || isInlineBase64DataUrl(item.imageUrl)) {
    throw new Error(`Refusing Firestore write for "${item.name}": raw base64 image must be uploaded to Firebase Storage first.`);
  }

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    subType: item.subType,
    length: item.length || '',
    season: item.season || 'all-season',
    color: item.color,
    formality: item.formality,
    image: candidateUrl,
    imageUrl: candidateUrl,
    storagePath: item.storagePath || null,
    userId: scope.userId,
    authUid: scope.authUid,
    vaultKey: scope.vaultKey,
    updatedAt: timestamp,
    synced: true,
  };
}

/** Process tasks in a bounded concurrent worker pool using Promise.allSettled semantics. */
export async function runWithBoundedConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
  onItemSettled?: (index: number, outcome: PromiseSettledResult<R>) => void
): Promise<Array<PromiseSettledResult<R>>> {
  const limit = Math.max(1, Math.min(concurrency, items.length || 1));
  const results: Array<PromiseSettledResult<R>> = new Array(items.length);
  let cursor = 0;

  const workers = Array.from({ length: limit }, async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      const current = items[idx];
      try {
        const value = await worker(current, idx);
        results[idx] = { status: 'fulfilled', value };
      } catch (reason) {
        results[idx] = { status: 'rejected', reason };
      }
      if (onItemSettled) {
        onItemSettled(idx, results[idx]);
      }
    }
  });

  await Promise.all(workers);
  return results;
}

/** Split an array into deterministic batch chunks (e.g. <= 400 ops for Firestore writeBatch). */
export function chunkItems<T>(items: readonly T[], chunkSize: number = FIRESTORE_BATCH_MAX_OPS): T[][] {
  const size = Math.max(1, chunkSize);
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function formatErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string' && err) return err;
  return 'Unknown upload error';
}

/**
 * Derive honest UI status strictly from confirmed writes and unresolved failures.
 * Never reports 'Cloud Synced' when any item is still pending or failed.
 */
export function deriveHonestSyncStatus(
  failedCount: number,
  committedCount: number
): { status: CloudSyncStatus; label: string } {
  if (failedCount > 0 && committedCount > 0) {
    return {
      status: 'partial',
      label: `${failedCount} failed (${committedCount} synced)`,
    };
  }
  if (failedCount > 0) {
    return {
      status: 'error',
      label: `Sync Error (${failedCount} failed)`,
    };
  }
  return { status: 'connected', label: 'Cloud Synced' };
}

/**
 * Executes a mass or single wardrobe upload:
 * 1) Uploads inline images in controlled batches to Firebase Storage.
 * 2) Strips base64 payloads and writes Firestore metadata batches atomically via writeBatch.
 * 3) Collects exact per-item failures without falsely reporting 'Cloud Synced'.
 */
export async function syncWardrobeItemsBatch(
  items: readonly LocalWardrobeItem[],
  scope: SyncUserScope,
  adapters: CloudSyncAdapters,
  options: { concurrency?: number; existingAllItems?: CloudWardrobeItem[] } = {}
): Promise<BatchSyncResult> {
  const concurrency = Math.max(1, Math.min(options.concurrency ?? DEFAULT_UPLOAD_CONCURRENCY, 5));
  const now = Date.now();
  const failedRecords: FailedSyncRecord[] = [];
  const readyForFirestore: CloudWardrobeItem[] = [];
  let completed = 0;

  adapters.onProgress?.({
    phase: 'uploading',
    total: items.length,
    completed: 0,
    succeeded: 0,
    failed: 0,
  });

  let succeededCount = 0;
  let failedStorageCount = 0;
  const storageOutcomes = await runWithBoundedConcurrency(
    items,
    concurrency,
    async (item) => {
      const needsUpload = isInlineBase64DataUrl(item.image) && !item.imageUrl;
      if (!needsUpload) {
        return sanitizeItemForFirestore(item, scope, now);
      }

      const uploaded = await adapters.uploadItemImage(item, scope);
      return sanitizeItemForFirestore(
        {
          ...item,
          image: uploaded.imageUrl,
          imageUrl: uploaded.imageUrl,
          storagePath: uploaded.storagePath,
        },
        scope,
        now
      );
    },
    (idx, outcome) => {
      completed++;
      const sourceItem = items[idx];
      if (outcome.status === 'fulfilled') {
        readyForFirestore.push(outcome.value);
        succeededCount++;
      } else {
        failedStorageCount++;
        failedRecords.push({
          item: sourceItem,
          stage: 'storage',
          reason: formatErrorMessage(outcome.reason),
          failedAt: Date.now(),
        });
      }
      adapters.onProgress?.({
        phase: 'uploading',
        total: items.length,
        completed,
        succeeded: succeededCount,
        failed: failedStorageCount,
        currentLabel: sourceItem.name,
      });
    }
  );
  void storageOutcomes;

  const committedItems: CloudWardrobeItem[] = [];
  let batchesCommitted = 0;

  if (readyForFirestore.length > 0) {
    adapters.onProgress?.({
      phase: 'committing',
      total: items.length,
      completed,
      succeeded: readyForFirestore.length,
      failed: failedRecords.length,
    });

    const chunks = chunkItems(readyForFirestore, FIRESTORE_BATCH_MAX_OPS);
    for (const chunk of chunks) {
      const batchBytes = measureJsonUtf8Bytes(chunk);
      if (batchBytes > FIRESTORE_SAFE_DOC_BYTES * chunks.length) {
        for (const item of chunk) {
          failedRecords.push({
            item,
            stage: 'validation',
            reason: `Metadata batch size exceeded safe limit (${batchBytes} bytes).`,
            failedAt: Date.now(),
          });
        }
        continue;
      }

      try {
        await adapters.commitFirestoreItemsBatch(chunk, scope);
        committedItems.push(...chunk);
        batchesCommitted++;
      } catch (err) {
        const msg = formatErrorMessage(err);
        for (const item of chunk) {
          failedRecords.push({
            item,
            stage: 'firestore',
            reason: msg,
            failedAt: Date.now(),
          });
        }
      }
    }

    if (adapters.updateVaultSummary && committedItems.length > 0) {
      try {
        const mergedMap = new Map<string, CloudWardrobeItem>();
        for (const existing of options.existingAllItems || []) {
          mergedMap.set(existing.id, existing);
        }
        for (const saved of committedItems) {
          mergedMap.set(saved.id, saved);
        }
        const summaryItems = Array.from(mergedMap.values());
        const summaryBytes = measureJsonUtf8Bytes(summaryItems);
        if (summaryBytes <= FIRESTORE_SAFE_DOC_BYTES) {
          await adapters.updateVaultSummary(summaryItems, scope);
        }
      } catch (err) {
        const msg = formatErrorMessage(err);
        for (const saved of committedItems) {
          failedRecords.push({
            item: saved,
            stage: 'firestore',
            reason: `Vault summary sync failed: ${msg}`,
            failedAt: Date.now(),
          });
        }
        committedItems.length = 0;
      }
    }
  }

  const { status, label } = deriveHonestSyncStatus(failedRecords.length, committedItems.length);
  adapters.onProgress?.({
    phase: 'done',
    total: items.length,
    completed: items.length,
    succeeded: committedItems.length,
    failed: failedRecords.length,
  });

  return {
    status,
    statusLabel: label,
    syncedItems: committedItems,
    failedRecords,
    batchesCommitted,
  };
}

/** Merge remote onSnapshot items under userId scope with any local items waiting in the retry queue. */
export function mergeRealtimeWardrobeSnapshot(
  remoteItems: readonly CloudWardrobeItem[],
  failedQueue: readonly FailedSyncRecord[],
  scope: SyncUserScope
): LocalWardrobeItem[] {
  const scopedRemote = remoteItems.filter((it) => it.userId === scope.userId || it.vaultKey === scope.vaultKey);
  const byId = new Map<string, LocalWardrobeItem>();
  for (const item of scopedRemote) {
    byId.set(item.id, item);
  }
  for (const failed of failedQueue) {
    if (!byId.has(failed.item.id)) {
      byId.set(failed.item.id, failed.item);
    }
  }
  return Array.from(byId.values());
}
