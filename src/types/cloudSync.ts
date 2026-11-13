export type CloudSyncStatus = 'connecting' | 'syncing' | 'connected' | 'partial' | 'error' | 'offline';

export interface FirebaseAuthUserLike {
  uid: string;
  isAnonymous?: boolean;
  email?: string | null;
}

export interface SyncUserScope {
  userId: string;
  authUid: string | null;
  vaultKey: string;
}

export interface LocalWardrobeItem {
  id: string;
  name: string;
  category: string;
  subType: string;
  length?: string;
  season?: string;
  color: string;
  formality: string;
  image?: string | null;
  imageUrl?: string | null;
  storagePath?: string | null;
  userId?: string;
  authUid?: string | null;
  vaultKey?: string;
  updatedAt?: number;
  synced?: boolean;
}

export interface CloudWardrobeItem extends LocalWardrobeItem {
  image: string | null;
  imageUrl: string | null;
  storagePath: string | null;
  userId: string;
  authUid: string | null;
  vaultKey: string;
  updatedAt: number;
  synced: true;
}

export interface FailedSyncRecord {
  item: LocalWardrobeItem;
  stage: 'storage' | 'firestore' | 'validation';
  reason: string;
  failedAt: number;
}

export interface BatchUploadProgress {
  phase: 'compressing' | 'uploading' | 'committing' | 'done';
  total: number;
  completed: number;
  succeeded: number;
  failed: number;
  currentLabel?: string;
}

export interface BatchSyncResult {
  status: CloudSyncStatus;
  statusLabel: string;
  syncedItems: CloudWardrobeItem[];
  failedRecords: FailedSyncRecord[];
  batchesCommitted: number;
}

export interface StorageUploadResult {
  imageUrl: string;
  storagePath: string;
  bytes: number;
}

export interface CloudSyncAdapters {
  uploadItemImage: (
    item: LocalWardrobeItem,
    scope: SyncUserScope
  ) => Promise<StorageUploadResult>;
  commitFirestoreItemsBatch: (
    items: CloudWardrobeItem[],
    scope: SyncUserScope
  ) => Promise<void>;
  updateVaultSummary?: (
    allItems: CloudWardrobeItem[],
    scope: SyncUserScope
  ) => Promise<void>;
  onProgress?: (progress: BatchUploadProgress) => void;
}
