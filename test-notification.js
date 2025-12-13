// Test script to verify notification creation
import { createPublicNotification } from './src/services/apiNotifications.js';

// Test with valid UUIDs
console.log('Testing with valid UUIDs...');
createPublicNotification({
    clinic_id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Notification',
    message: 'This is a test notification',
    type: 'appointment',
    appointment_id: '123e4567-e89b-12d3-a456-426614174001',
    patient_id: '123e4567-e89b-12d3-a456-426614174002'
}).then(result => {
    console.log('Success:', result);
}).catch(error => {
    console.error('Error:', error);
});

// Test with invalid IDs
console.log('Testing with invalid IDs...');
createPublicNotification({
    clinic_id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Notification',
    message: 'This is a test notification',
    type: 'appointment',
    appointment_id: '90', // Invalid UUID
    patient_id: 'invalid-id' // Invalid UUID
}).then(result => {
    console.log('Success:', result);
}).catch(error => {
    console.error('Error:', error);
});