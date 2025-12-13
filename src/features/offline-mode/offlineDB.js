import { openDB } from 'idb';

const DB_NAME = 'TabibiOfflineDB';
const DB_VERSION = 1;

// Define store names
export const STORE_NAMES = {
  PATIENTS: 'patients',
  APPOINTMENTS: 'appointments',
  TREATMENT_PLANS: 'treatmentPlans',
  PRESCRIPTIONS: 'prescriptions',
  NOTIFICATIONS: 'notifications',
  OFFLINE_QUEUE: 'offlineQueue'
};

// Initialize the database
export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create patients store
      if (!db.objectStoreNames.contains(STORE_NAMES.PATIENTS)) {
        const patientsStore = db.createObjectStore(STORE_NAMES.PATIENTS, { keyPath: 'id' });
        patientsStore.createIndex('clinic_id', 'clinic_id');
        patientsStore.createIndex('name', 'name');
        patientsStore.createIndex('phone', 'phone');
      }

      // Create appointments store
      if (!db.objectStoreNames.contains(STORE_NAMES.APPOINTMENTS)) {
        const appointmentsStore = db.createObjectStore(STORE_NAMES.APPOINTMENTS, { keyPath: 'id' });
        appointmentsStore.createIndex('clinic_id', 'clinic_id');
        appointmentsStore.createIndex('patient_id', 'patient_id');
        appointmentsStore.createIndex('date', 'date');
        appointmentsStore.createIndex('status', 'status');
      }

      // Create treatment plans store
      if (!db.objectStoreNames.contains(STORE_NAMES.TREATMENT_PLANS)) {
        const treatmentPlansStore = db.createObjectStore(STORE_NAMES.TREATMENT_PLANS, { keyPath: 'id' });
        treatmentPlansStore.createIndex('clinic_id', 'clinic_id');
        treatmentPlansStore.createIndex('patient_id', 'patient_id');
      }

      // Create prescriptions store
      if (!db.objectStoreNames.contains(STORE_NAMES.PRESCRIPTIONS)) {
        const prescriptionsStore = db.createObjectStore(STORE_NAMES.PRESCRIPTIONS, { keyPath: 'id' });
        prescriptionsStore.createIndex('clinic_id', 'clinic_id');
        prescriptionsStore.createIndex('patient_id', 'patient_id');
        prescriptionsStore.createIndex('visit_id', 'visit_id');
      }

      // Create notifications store (read-only)
      if (!db.objectStoreNames.contains(STORE_NAMES.NOTIFICATIONS)) {
        const notificationsStore = db.createObjectStore(STORE_NAMES.NOTIFICATIONS, { keyPath: 'id' });
        notificationsStore.createIndex('clinic_id', 'clinic_id');
        notificationsStore.createIndex('is_read', 'is_read');
        notificationsStore.createIndex('created_at', 'created_at');
      }

      // Create offline queue store
      if (!db.objectStoreNames.contains(STORE_NAMES.OFFLINE_QUEUE)) {
        const queueStore = db.createObjectStore(STORE_NAMES.OFFLINE_QUEUE, { keyPath: 'id', autoIncrement: true });
        queueStore.createIndex('timestamp', 'timestamp');
        queueStore.createIndex('synced', 'synced');
        queueStore.createIndex('entityType', 'entityType');
      }
    }
  });
}

// Get database instance
export async function getDB() {
  return openDB(DB_NAME, DB_VERSION);
}

// Helper functions for CRUD operations
export async function addItem(storeName, item) {
  const db = await getDB();
  return db.add(storeName, item);
}

export async function getItem(storeName, key) {
  const db = await getDB();
  return db.get(storeName, key);
}

export async function getAllItems(storeName) {
  const db = await getDB();
  return db.getAll(storeName);
}

export async function updateItem(storeName, key, item) {
  const db = await getDB();
  return db.put(storeName, item);
}

export async function deleteItem(storeName, key) {
  const db = await getDB();
  return db.delete(storeName, key);
}

export async function clearStore(storeName) {
  const db = await getDB();
  return db.clear(storeName);
}

// Search patients by name or phone
export async function searchPatientsOffline(searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    return getAllItems(STORE_NAMES.PATIENTS);
  }
  
  const db = await getDB();
  const tx = db.transaction(STORE_NAMES.PATIENTS, 'readonly');
  const store = tx.objectStore(STORE_NAMES.PATIENTS);
  
  // Get all patients
  const allPatients = await store.getAll();
  
  // Filter patients based on search term (name or phone)
  const filteredPatients = allPatients.filter(patient => {
    const nameMatch = patient.name && patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = patient.phone && patient.phone.includes(searchTerm);
    return nameMatch || phoneMatch;
  });
  
  return filteredPatients;
}

// Queue operations
export async function addToQueue(operation) {
  const db = await getDB();
  const timestamp = new Date().toISOString();
  
  const queueItem = {
    ...operation,
    timestamp,
    synced: false
  };
  
  return db.add(STORE_NAMES.OFFLINE_QUEUE, queueItem);
}

export async function getUnsyncedItems() {
  const db = await getDB();
  const tx = db.transaction(STORE_NAMES.OFFLINE_QUEUE, 'readonly');
  const store = tx.objectStore(STORE_NAMES.OFFLINE_QUEUE);
  const index = store.index('synced');
  return index.getAll(IDBKeyRange.only(false));
}

export async function markAsSynced(queueId) {
  const db = await getDB();
  const tx = db.transaction(STORE_NAMES.OFFLINE_QUEUE, 'readwrite');
  const store = tx.objectStore(STORE_NAMES.OFFLINE_QUEUE);
  
  const item = await store.get(queueId);
  if (item) {
    item.synced = true;
    await store.put(item);
  }
  
  return tx.done;
}

export async function removeFromQueue(queueId) {
  const db = await getDB();
  return db.delete(STORE_NAMES.OFFLINE_QUEUE, queueId);
}