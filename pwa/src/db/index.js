import { openDB } from 'idb';

const DB_NAME = 'novaclub_db';
const DB_VERSION = 2;

export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('members')) {
        const memberStore = db.createObjectStore('members', { keyPath: 'id' });
        memberStore.createIndex('club_id', 'club_id');
        memberStore.createIndex('updated_at', 'updated_at');
      }

      if (!db.objectStoreNames.contains('payments')) {
        const paymentStore = db.createObjectStore('payments', { keyPath: 'id' });
        paymentStore.createIndex('club_id', 'club_id');
        paymentStore.createIndex('member_id', 'member_id');
        paymentStore.createIndex('updated_at', 'updated_at');
      }

      if (!db.objectStoreNames.contains('licenses')) {
        const licenseStore = db.createObjectStore('licenses', { keyPath: 'id' });
        licenseStore.createIndex('club_id', 'club_id');
        licenseStore.createIndex('member_id', 'member_id');
        licenseStore.createIndex('updated_at', 'updated_at');
      }

      if (!db.objectStoreNames.contains('equipment')) {
        const equipmentStore = db.createObjectStore('equipment', { keyPath: 'id' });
        equipmentStore.createIndex('club_id', 'club_id');
        equipmentStore.createIndex('updated_at', 'updated_at');
      }

      if (!db.objectStoreNames.contains('equipment_purchases')) {
        const purchaseStore = db.createObjectStore('equipment_purchases', { keyPath: 'id' });
        purchaseStore.createIndex('club_id', 'club_id');
        purchaseStore.createIndex('member_id', 'member_id');
        purchaseStore.createIndex('updated_at', 'updated_at');
      }

      if (!db.objectStoreNames.contains('attendances')) {
        const attendanceStore = db.createObjectStore('attendances', { keyPath: 'id' });
        attendanceStore.createIndex('club_id', 'club_id');
        attendanceStore.createIndex('member_id', 'member_id');
        attendanceStore.createIndex('attendance_date', 'attendance_date');
        attendanceStore.createIndex('updated_at', 'updated_at');
      }

      if (!db.objectStoreNames.contains('transactions')) {
        const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
        transactionStore.createIndex('club_id', 'club_id');
        transactionStore.createIndex('updated_at', 'updated_at');
      }

      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
        messageStore.createIndex('club_id', 'club_id');
        messageStore.createIndex('updated_at', 'updated_at');
      }

      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('sync_metadata')) {
        db.createObjectStore('sync_metadata', { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains('settings')) {
        const settingsStore = db.createObjectStore('settings', { keyPath: 'id' });
        settingsStore.createIndex('updated_at', 'updated_at');
      }
    },
  });

  return db;
};

export const getDB = async () => {
  return await openDB(DB_NAME, DB_VERSION);
};

export const getAllFromStore = async (storeName) => {
  const db = await getDB();
  return await db.getAll(storeName);
};

export const getFromStore = async (storeName, id) => {
  const db = await getDB();
  return await db.get(storeName, id);
};

export const addToStore = async (storeName, data) => {
  const db = await getDB();
  data.updated_at = new Date().toISOString();
  return await db.put(storeName, data);
};

export const updateInStore = async (storeName, data) => {
  const db = await getDB();
  data.updated_at = new Date().toISOString();
  return await db.put(storeName, data);
};

export const deleteFromStore = async (storeName, id) => {
  const db = await getDB();
  return await db.delete(storeName, id);
};

export const clearStore = async (storeName) => {
  const db = await getDB();
  return await db.clear(storeName);
};
