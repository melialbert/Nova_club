import { getDB, addToStore, getAllFromStore } from '../db';
import { apiCall } from './api';

const SYNC_INTERVAL = 30000;
let syncIntervalId = null;

export const startSync = () => {
  if (syncIntervalId) return;

  performSync();

  syncIntervalId = setInterval(() => {
    performSync();
  }, SYNC_INTERVAL);

  window.addEventListener('online', performSync);
};

export const stopSync = () => {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
  window.removeEventListener('online', performSync);
};

export const performSync = async () => {
  if (!navigator.onLine) {
    return;
  }

  try {
    await pushChanges();
    await pullChanges();
  } catch (error) {
    console.error('Sync failed:', error);
  }
};

const pushChanges = async () => {
  const db = await getDB();
  const syncQueue = await db.getAll('sync_queue');

  if (syncQueue.length === 0) return;

  const changesByEntity = {};

  for (const item of syncQueue) {
    if (!changesByEntity[item.entity]) {
      changesByEntity[item.entity] = [];
    }
    changesByEntity[item.entity].push({
      id: item.record_id,
      data: item.data
    });
  }

  try {
    const response = await apiCall('/sync/push', {
      method: 'POST',
      body: JSON.stringify(changesByEntity)
    });

    if (response.results.success.length > 0) {
      for (const item of syncQueue) {
        await db.delete('sync_queue', item.id);
      }
    }
  } catch (error) {
    console.error('Push failed:', error);
  }
};

const pullChanges = async () => {
  const db = await getDB();

  const lastSync = {};
  const stores = ['members', 'payments', 'licenses', 'equipment', 'equipment_purchases', 'attendances', 'transactions', 'messages', 'employees'];

  for (const store of stores) {
    const metadata = await db.get('sync_metadata', store);
    if (metadata) {
      lastSync[store] = metadata.last_sync;
    }
  }

  try {
    const response = await apiCall('/sync/pull', {
      method: 'POST',
      body: JSON.stringify(lastSync)
    });

    if (response.changes) {
      for (const [entityName, records] of Object.entries(response.changes)) {
        for (const record of records) {
          await addToStore(entityName, record.data);
        }

        await db.put('sync_metadata', {
          key: entityName,
          last_sync: response.sync_timestamp
        });
      }
    }
  } catch (error) {
    console.error('Pull failed:', error);
  }
};

export const queueChange = async (entity, recordId, data) => {
  const db = await getDB();
  await db.add('sync_queue', {
    entity,
    record_id: recordId,
    data,
    queued_at: new Date().toISOString()
  });

  if (navigator.onLine) {
    performSync();
  }
};
