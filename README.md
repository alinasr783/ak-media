# Tabibi Medical Clinic Management System

A comprehensive medical clinic management system built with React and Supabase.

## Features

- Patient management
- Appointment scheduling
- Treatment plans
- Financial tracking
- Online booking
- Subscription management
- Offline mode support

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Supabase account

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Development

To start the development server:
```bash
npm run dev
```

## Build

To create a production build:
```bash
npm run build
```

## Deployment

This project can be deployed to Vercel, Netlify, or any static hosting service.

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure the environment variables in Vercel dashboard
4. Deploy!

## Project Structure

```
src/
├── components/        # Reusable UI components
├── features/          # Feature-specific components and logic
├── pages/             # Page components
├── services/          # API services and Supabase integration
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and helpers
└── constants/         # Application constants
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.