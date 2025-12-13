import { useState } from 'react';
import { useOfflineData } from './useOfflineData';
import { useOffline } from './OfflineContext';

export default function TestOfflineComponent() {
  const [testData, setTestData] = useState('');
  const { createPatientOffline, getOfflinePatients } = useOfflineData();
  const { isOnline, isOfflineMode } = useOffline();
  const [patients, setPatients] = useState([]);

  const handleCreatePatient = async () => {
    if (!testData) return;
    
    try {
      const patientData = {
        name: testData,
        phone: '0501234567',
        gender: 'male',
        clinic_id: 'test-clinic-id'
      };
      
      const result = await createPatientOffline(patientData);
      console.log('Patient created offline:', result);
      setTestData('');
    } catch (error) {
      console.error('Error creating patient offline:', error);
    }
  };

  const handleGetPatients = async () => {
    try {
      const result = await getOfflinePatients();
      setPatients(result);
      console.log('Offline patients:', result);
    } catch (error) {
      console.error('Error getting offline patients:', error);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">Offline Mode Test Component</h2>
      
      <div className="mb-4">
        <p className="mb-2"><strong>Connection Status:</strong> {isOnline ? 'Online' : 'Offline'}</p>
        <p className="mb-2"><strong>Offline Mode:</strong> {isOfflineMode ? 'Active' : 'Inactive'}</p>
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          value={testData}
          onChange={(e) => setTestData(e.target.value)}
          placeholder="Enter patient name"
          className="border p-2 rounded mr-2"
        />
        <button 
          onClick={handleCreatePatient}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Patient Offline
        </button>
      </div>
      
      <div className="mb-4">
        <button 
          onClick={handleGetPatients}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Get Offline Patients
        </button>
      </div>
      
      {patients.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Offline Patients:</h3>
          <ul>
            {patients.map((patient) => (
              <li key={patient.id} className="mb-1">
                {patient.name} (ID: {patient.id})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}