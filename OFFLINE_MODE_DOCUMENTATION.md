# Offline Mode Implementation Documentation

## Overview

This document explains the implementation of the Offline Mode feature for the Tabibi Web SaaS platform. The feature allows users to continue working normally even when the internet connection is lost, with all changes saved locally and automatically synchronized with the server when connectivity is restored.

## Architecture

### Components

1. **Service Worker** (`public/sw.js`)
   - Caches static assets for offline access
   - Enables the application to load even without internet

2. **IndexedDB Database** (`src/features/offline-mode/offlineDB.js`)
   - Local database using the `idb` library
   - Stores patients, appointments, treatment plans, prescriptions, and notifications
   - Maintains an offline queue for operations performed while offline

3. **Offline Context** (`src/features/offline-mode/OfflineContext.jsx`)
   - Manages online/offline state
   - Handles automatic synchronization when connectivity is restored
   - Provides context for other components to react to connectivity changes

4. **Offline Data Hook** (`src/features/offline-mode/useOfflineData.js`)
   - Provides functions to perform CRUD operations on local data
   - Manages the offline operation queue

5. **UI Indicator** (`src/components/OfflineIndicator.jsx`)
   - Visual indicator showing connectivity status
   - Displays synchronization progress

### Data Flow

1. **Online Mode**: All operations are performed directly on the server
2. **Offline Detection**: When connectivity is lost, the app switches to offline mode
3. **Local Storage**: All operations are saved to IndexedDB
4. **Queue Management**: Operations are added to an offline queue for later synchronization
5. **Reconnection**: When connectivity is restored, queued operations are automatically synchronized
6. **Conflict Resolution**: Last-write-wins strategy is used for conflict resolution

## Implementation Details

### Database Structure

The IndexedDB database contains the following stores:

- `patients`: Patient records
- `appointments`: Appointment records
- `treatmentPlans`: Treatment plan records
- `prescriptions`: Prescription records
- `notifications`: Notification records (read-only)
- `offlineQueue`: Queue of operations to be synchronized

### Service Worker

The service worker caches critical static assets to enable offline loading of the application.

### Offline Context

The OfflineContext monitors network connectivity and manages the synchronization process:

- Detects online/offline transitions
- Automatically triggers synchronization when coming back online
- Manages synchronization progress and status messages

### Offline Data Operations

The useOfflineData hook provides functions for performing CRUD operations on local data:

- `createPatientOffline`, `updatePatientOffline`, `deletePatientOffline`
- `createAppointmentOffline`, `updateAppointmentOffline`, `deleteAppointmentOffline`
- `createTreatmentPlanOffline`, `updateTreatmentPlanOffline`, `deleteTreatmentPlanOffline`

## Integration with Existing Features

### Patient Management

The PatientCreateDialog has been updated to use the offline-enabled `useCreatePatientOffline` hook, which:

- Creates patients locally when offline
- Adds creation operations to the synchronization queue
- Creates patients on the server when online
- Shows appropriate notifications for both modes

## Extending Offline Support

To add offline support to other features:

1. Add the entity to the IndexedDB schema in `offlineDB.js`
2. Create offline operation functions in `useOfflineData.js`
3. Create an offline-enabled hook similar to `useCreatePatientOffline.js`
4. Update the UI components to use the offline-enabled hooks

## Conflict Resolution

The current implementation uses a last-write-wins strategy for conflict resolution. More sophisticated conflict resolution strategies can be implemented as needed.

## Security Considerations

- Sensitive data stored locally should be encrypted
- Local data is automatically cleared after successful synchronization
- Authentication tokens are not stored in the offline database

## Testing Offline Mode

To test the offline mode:

1. Open the application in a browser
2. Perform some operations while online
3. Disconnect from the internet (turn off WiFi/mobile data)
4. Perform operations while offline
5. Reconnect to the internet
6. Observe automatic synchronization of offline operations

## Future Improvements

1. Implement more sophisticated conflict resolution strategies
2. Add encryption for sensitive local data
3. Implement data expiration for local storage
4. Add support for more entity types
5. Improve error handling and user notifications