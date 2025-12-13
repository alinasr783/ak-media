import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { initDB, getUnsyncedItems, markAsSynced, removeFromQueue, addToQueue } from './offlineDB';
import { useAuth } from '../auth';
import { toast } from 'react-hot-toast';
import { 
  createPatient, 
  updatePatient, 
  getPatientById 
} from '../../services/apiPatients';
import { 
  createAppointment, 
  updateAppointment 
} from '../../services/apiAppointments';
import { 
  createTreatmentTemplate, 
  updateTreatmentTemplate 
} from '../../services/apiTreatmentTemplates';
import supabase from '../../services/supabase';

const OfflineContext = createContext();

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState('');
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);

  // Initialize the database
  useEffect(() => {
    const init = async () => {
      try {
        console.log('Initializing offline database...');
        await initDB();
        setInitialized(true);
        console.log('Offline database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize offline database:', error);
        toast.error('فشل في تهيئة قاعدة البيانات المحلية');
      }
    };

    init();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Online event detected');
      setIsOnline(true);
      toast.success('تم استعادة الاتصال بالإنترنت');
      syncOfflineData();
    };

    const handleOffline = () => {
      console.log('Offline event detected');
      setIsOnline(false);
      toast.error('أنت غير متصل بالإنترنت حاليًا، سيتم حفظ التغييرات ومزامنتها تلقائيًا عند عودة الاتصال.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync data when coming back online
  const syncOfflineData = useCallback(async () => {
    if (!user || !initialized) return;

    console.log('Starting sync process...');
    setIsSyncing(true);
    setSyncProgress(0);
    setSyncMessage('جارٍ المزامنة...');

    try {
      const unsyncedItems = await getUnsyncedItems();
      const totalItems = unsyncedItems.length;
      
      console.log(`Found ${totalItems} items to sync`);
      
      if (totalItems === 0) {
        setSyncMessage('تمت المزامنة بنجاح');
        setTimeout(() => {
          setIsSyncing(false);
          setSyncMessage('');
        }, 2000);
        return;
      }

      let processedItems = 0;

      for (const item of unsyncedItems) {
        try {
          setSyncProgress(Math.round((processedItems / totalItems) * 100));
          console.log('Processing item:', item);
          
          // Process based on entity type and operation
          switch (item.entityType) {
            case 'patient':
              if (item.operation === 'create') {
                // Create patient with server-generated ID
                const serverPatient = await createPatient(item.data);
                // Update local record with server ID
                // This would require updating the local database, but for simplicity we'll just mark as synced
              } else if (item.operation === 'update') {
                await updatePatient(item.entityId, item.data);
              }
              break;
              
            case 'appointment':
              if (item.operation === 'create') {
                await createAppointment(item.data);
              } else if (item.operation === 'update') {
                await updateAppointment(item.entityId, item.data);
              }
              break;
              
            case 'treatmentPlan':
              if (item.operation === 'create') {
                await createTreatmentTemplate(item.data);
              } else if (item.operation === 'update') {
                await updateTreatmentTemplate(item.entityId, item.data);
              }
              break;
              
            default:
              console.warn('Unknown entity type for sync:', item.entityType);
          }

          // Mark item as synced
          await markAsSynced(item.id);
          processedItems++;
        } catch (error) {
          console.error('Error syncing item:', item, error);
          // For critical errors, we might want to notify the user
          if (error.message.includes('network')) {
            toast.error('فشل في المزامنة - إعادة المحاولة تلقائيًا');
            break; // Stop syncing if network error
          }
        }
      }

      setSyncProgress(100);
      setSyncMessage('تمت المزامنة بنجاح');
      
      setTimeout(() => {
        setIsSyncing(false);
        setSyncMessage('');
      }, 2000);
      
      toast.success(`تمت مزامنة ${processedItems} من ${totalItems} عملية`);
    } catch (error) {
      console.error('Error during sync:', error);
      setIsSyncing(false);
      setSyncMessage('فشلت المزامنة – إعادة المحاولة');
      toast.error('فشلت المزامنة – إعادة المحاولة تلقائيًا');
    }
  }, [user, initialized]);

  // Function to add operation to offline queue
  const enqueueOperation = useCallback(async (entityType, operation, data, entityId = null) => {
    if (!initialized) return;

    try {
      const queueItem = {
        entityType,
        operation,
        data,
        entityId,
        timestamp: new Date().toISOString()
      };

      // Add to offline queue
      await addToQueue(queueItem);
      console.log('Enqueuing operation:', queueItem);
      
      // Show notification when offline
      if (!isOnline) {
        toast.success('تم حفظ التغييرات محليًا وسيتم مزامنتها تلقائيًا');
      }
    } catch (error) {
      console.error('Error enqueuing operation:', error);
      toast.error('فشل في حفظ التغييرات المحلية');
    }
  }, [initialized, isOnline]);

  // Function to check if we're in offline mode
  const isOfflineMode = !isOnline;

  const value = {
    isOnline,
    isOfflineMode,
    isSyncing,
    syncProgress,
    syncMessage,
    enqueueOperation,
    syncOfflineData
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}