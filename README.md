# Tabibi Medical Clinic Management System

A comprehensive web-based solution for managing medical clinics, featuring patient records, appointment scheduling, treatment plans, and financial tracking.

## Features

- **Patient Management**: Store and manage patient information, medical history, and visit records
- **Appointment Scheduling**: Calendar-based appointment system with reminders
- **Treatment Plans**: Create and track personalized treatment plans for patients
- **Financial Tracking**: Manage payments, billing, and financial reports
- **Online Booking**: Allow patients to book appointments online
- **Notifications**: Real-time notifications for appointments, payments, and clinic updates
- **Multi-user Support**: Role-based access control for doctors and secretaries
- **Subscription Management**: Tiered pricing plans with usage limits
- **Offline Mode**: Continue working even without internet connectivity

## Offline Mode

The Tabibi platform includes a robust offline mode that allows users to continue working normally even when the internet connection is lost. All changes are saved locally and automatically synchronized with the server when connectivity is restored.

### How Offline Mode Works

1. **Automatic Detection**: The system automatically detects when internet connectivity is lost
2. **Local Storage**: All operations are saved to a local IndexedDB database
3. **Queue Management**: Operations are queued for synchronization when connectivity is restored
4. **Automatic Sync**: When internet connectivity is restored, queued operations are automatically synchronized
5. **Conflict Resolution**: Uses a last-write-wins strategy for conflict resolution

### Supported Offline Features

- Patient creation, editing, and deletion
- Appointment creation, editing, and deletion
- Treatment plan creation, editing, and deletion
- Viewing existing data (patients, appointments, etc.)

### Limitations in Offline Mode

- Features requiring real-time data (payments, online booking submissions) are disabled
- New user registrations are not available
- Some reporting features may show outdated data

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Supabase (Database, Authentication, Realtime)
- **State Management**: React Query
- **UI Components**: Radix UI, Lucide Icons
- **Forms**: React Hook Form
- **Routing**: React Router
- **Offline Support**: IndexedDB, Service Workers

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`

## Deployment

The application can be deployed to any static hosting service. For Supabase integration, ensure environment variables are properly configured.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License.