import assert from 'node:assert/strict';
import {
  DEFAULT_UPLOAD_CONCURRENCY,
  isInlineBase64DataUrl,
  mergeRealtimeWardrobeSnapshot,
  resolveSyncUserScope,
  sanitizeItemForFirestore,
  syncWardrobeItemsBatch,
} from '../src/services/massUploadSync.js';
import type {
  CloudWardrobeItem,
  LocalWardrobeItem,
} from '../src/types/cloudSync.js';

function makeMock15Items(): LocalWardrobeItem[] {
  const fakeBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(2048);
  return Array.from({ length: 15 }, (_, idx) => ({
    id: `mass-item-${idx + 1}`,
    name: `Tailored Garment #${idx + 1}`,
    category: idx % 3 === 0 ? 'outerwear' : idx % 2 === 0 ? 'bottoms' : 'tops',
    subType: idx % 3 === 0 ? 'Blazer' : idx % 2 === 0 ? 'Chinos' : 'Oxford Shirt',
    length: 'long',
    season: 'all-season',
    color: '#1e293b',
    formality: 'smart-casual',
    image: fakeBase64,
  }));
}

async function runTests(): Promise<void> {
  const scope = resolveSyncUserScope({ uid: 'anon_pc_device_01', isAnonymous: true }, 'marcelo-atelier-wardrobe');
  assert.equal(scope.userId, 'marcelo-atelier-wardrobe');
  assert.equal(scope.authUid, 'anon_pc_device_01');

  const signedInScope = resolveSyncUserScope(
    { uid: 'uid_authenticated_user_99', isAnonymous: false, email: 'user@example.com' },
    'marcelo-atelier-wardrobe'
  );
  assert.equal(signedInScope.userId, 'uid_authenticated_user_99');

  // Guard check: inline base64 must never enter Firestore
  assert.throws(() =>
    sanitizeItemForFirestore(
      {
        id: 'bad-1',
        name: 'Raw Base64 Shirt',
        category: 'tops',
        subType: 'T-Shirt',
        color: '#ffffff',
        formality: 'casual',
        imageUrl: 'data:image/png;base64,iVBORw0KGgo=',
      },
      scope,
      Date.now()
    )
  );

  // Scenario 1: 15-item mass upload with 3 simulated Firebase Storage failures
  const items = makeMock15Items();
  const failIds = new Set(['mass-item-4', 'mass-item-9', 'mass-item-13']);
  let inFlight = 0;
  let maxInFlight = 0;
  const firestoreStore = new Map<string, CloudWardrobeItem>();
  let summarySnapshots: CloudWardrobeItem[] = [];

  const partialResult = await syncWardrobeItemsBatch(items, scope, {
    uploadItemImage: async (item) => {
      inFlight++;
      if (inFlight > maxInFlight) maxInFlight = inFlight;
      await new Promise((r) => setTimeout(r, 15));
      inFlight--;

      if (failIds.has(item.id)) {
        throw new Error(`storage/retry-limit-exceeded for ${item.id}`);
      }
      return {
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/whatowear-app/o/${encodeURIComponent(item.id)}.jpg?alt=media`,
        storagePath: `wardrobes/${scope.vaultKey}/items/${item.id}.jpg`,
        bytes: 42_000,
      };
    },
    commitFirestoreItemsBatch: async (batchItems) => {
      for (const doc of batchItems) {
        assert.equal(isInlineBase64DataUrl(doc.image), false, 'Firestore doc must not contain base64');
        assert.equal(isInlineBase64DataUrl(doc.imageUrl), false, 'Firestore imageUrl must not contain base64');
        assert.equal(doc.userId, scope.userId);
        assert.equal(doc.vaultKey, scope.vaultKey);
        assert.ok(doc.imageUrl?.startsWith('https://'));
        firestoreStore.set(doc.id, doc);
      }
    },
    updateVaultSummary: async (allItems) => {
      summarySnapshots = allItems;
    },
  });

  assert.ok(
    maxInFlight <= DEFAULT_UPLOAD_CONCURRENCY,
    `Expected bounded concurrency <= ${DEFAULT_UPLOAD_CONCURRENCY}, observed ${maxInFlight}`
  );
  assert.notEqual(partialResult.status, 'connected', 'Failed promises must prevent connected status');
  assert.notEqual(partialResult.statusLabel, 'Cloud Synced', 'Failed promises must prevent false Cloud Synced label');
  assert.equal(partialResult.status, 'partial');
  assert.equal(partialResult.syncedItems.length, 12);
  assert.equal(partialResult.failedRecords.length, 3);
  assert.equal(firestoreStore.size, 12);
  assert.equal(summarySnapshots.length, 12);

  // Scenario 2: Retry Failed recovers remaining 3 items -> transitions cleanly to Cloud Synced
  const retryInputs = partialResult.failedRecords.map((f) => f.item);
  const retryResult = await syncWardrobeItemsBatch(
    retryInputs,
    scope,
    {
      uploadItemImage: async (item) => ({
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/whatowear-app/o/${encodeURIComponent(item.id)}.jpg?alt=media`,
        storagePath: `wardrobes/${scope.vaultKey}/items/${item.id}.jpg`,
        bytes: 41_500,
      }),
      commitFirestoreItemsBatch: async (batchItems) => {
        for (const doc of batchItems) {
          firestoreStore.set(doc.id, doc);
        }
      },
      updateVaultSummary: async (allItems) => {
        summarySnapshots = allItems;
      },
    },
    { existingAllItems: partialResult.syncedItems }
  );

  assert.equal(retryResult.status, 'connected');
  assert.equal(retryResult.statusLabel, 'Cloud Synced');
  assert.equal(retryResult.failedRecords.length, 0);
  assert.equal(firestoreStore.size, 15);
  assert.equal(summarySnapshots.length, 15);

  // Scenario 3: Firestore writeBatch rejection prevents false Cloud Synced even if Storage succeeded
  const batchFailResult = await syncWardrobeItemsBatch(items, scope, {
    uploadItemImage: async (item) => ({
      imageUrl: `https://firebasestorage.googleapis.com/v0/b/whatowear-app/o/${encodeURIComponent(item.id)}.jpg?alt=media`,
      storagePath: `wardrobes/${scope.vaultKey}/items/${item.id}.jpg`,
      bytes: 38_000,
    }),
    commitFirestoreItemsBatch: async () => {
      throw new Error('FirebaseError: Missing or insufficient permissions (permission-denied)');
    },
  });

  assert.equal(batchFailResult.status, 'error');
  assert.notEqual(batchFailResult.statusLabel, 'Cloud Synced');
  assert.equal(batchFailResult.syncedItems.length, 0);
  assert.equal(batchFailResult.failedRecords.length, 15);
  assert.equal(batchFailResult.failedRecords[0].stage, 'firestore');

  // Scenario 4: Real-time onSnapshot scoping filters unrelated users and preserves pending retry items
  const allRemoteDocs: CloudWardrobeItem[] = [
    ...Array.from(firestoreStore.values()),
    {
      id: 'other-user-doc',
      name: 'Foreign Vault Coat',
      category: 'outerwear',
      subType: 'Coat',
      color: '#000000',
      formality: 'formal',
      image: 'https://example.com/other.jpg',
      imageUrl: 'https://example.com/other.jpg',
      storagePath: 'wardrobes/other/items/other-user-doc.jpg',
      userId: 'someone-elses-uid',
      authUid: 'someone-elses-uid',
      vaultKey: 'other-vault',
      updatedAt: Date.now(),
      synced: true,
    },
  ];
  const merged = mergeRealtimeWardrobeSnapshot(allRemoteDocs, [], scope);
  assert.equal(merged.length, 15);
  assert.equal(merged.some((it) => it.id === 'other-user-doc'), false);

  console.log(
    JSON.stringify(
      {
        massUploadSimulationPassed: true,
        itemsTested: items.length,
        maxObservedConcurrency: maxInFlight,
        partialSyncStatus: partialResult.status,
        partialSyncLabel: partialResult.statusLabel,
        recoveredStatusLabel: retryResult.statusLabel,
        firestoreRejectStatus: batchFailResult.status,
        firestoreRejectFailedCount: batchFailResult.failedRecords.length,
        scopedSnapshotItems: merged.length,
      },
      null,
      2
    )
  );
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
