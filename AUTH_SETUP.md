# Tabibi Authentication System Setup Guide

## Overview
This authentication system uses Supabase for backend authentication with a multi-step registration process supporting two user roles: **Doctor** and **Secretary**.

## Features
- ✅ Multi-step registration form with validation
- ✅ Separate flows for Doctor and Secretary registration
- ✅ Unique clinic ID generation for doctors
- ✅ Clinic ID verification for secretaries
- ✅ Role-based access control
- ✅ Protected routes
- ✅ User profile display
- ✅ Logout functionality

## Setup Instructions

### 1. Database Setup
Execute the SQL commands in `database-schema.sql` in your Supabase SQL Editor:
- Navigate to your Supabase project dashboard
- Go to SQL Editor
- Copy and paste the contents of `database-schema.sql`
- Run the query

This will create:
- `users` table with all necessary columns
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

### 2. Environment Variables
Make sure you have the following in your `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Email Configuration (Optional)
In Supabase Dashboard:
- Go to Authentication > Email Templates
- Customize the email verification template if needed
- Enable/disable email confirmation based on your requirements

## Project Structure

```
src/
├── features/
│   └── auth/
│       ├── LoginForm.jsx          # Login form component
│       ├── SignupForm.jsx         # Multi-step registration form
│       ├── LogoutButton.jsx       # Logout button component
│       ├── UserProfile.jsx        # User profile display
│       ├── ProtectedRoute.jsx     # Route protection wrapper
│       ├── AuthContext.jsx        # Authentication context provider
│       ├── useLogin.js            # Login mutation hook
│       ├── useSignup.js           # Signup mutation hook
│       ├── useLogout.js           # Logout mutation hook
│       ├── useUser.js             # Get current user hook
│       └── useVerifyClinicId.js   # Clinic ID verification hook
├── services/
│   └── apiAuth.js                 # Authentication API functions
├── lib/
│   └── clinicIdGenerator.js       # Clinic ID generation utility
└── pages/
    ├── Login.jsx                  # Login page
    └── Signup.jsx                 # Signup page
```

## User Roles

### Doctor
When registering as a doctor:
- Selects "Doctor" as user type
- Chooses a subscription plan (Basic, Professional, Premium)
- Automatically receives a unique clinic ID in this format: `XXXXXX-YYMMDD-HHMM-LLLL`
  - `XXXXXX`: 6 random digits
  - `YYMMDD`: Registration date
  - `HHMM`: Registration time
  - `LLLL`: 4 random uppercase letters
- This clinic ID must be shared with secretaries

### Secretary
When registering as a secretary:
- Selects "Secretary" as user type
- Must enter the clinic ID provided by their doctor
- The system verifies the clinic ID exists
- Can optionally specify initial permissions (comma-separated)
- Final permissions are typically assigned by the doctor

## Database Schema

### Users Table
| Column       | Type      | Description                                    |
|--------------|-----------|------------------------------------------------|
| id           | UUID      | Primary key, references auth.users             |
| email        | TEXT      | User's email address                           |
| full_name    | TEXT      | User's full name                               |
| phone        | TEXT      | User's phone number                            |
| role         | TEXT      | User role: 'doctor' or 'secretary'             |
| clinic_id    | TEXT      | Unique clinic identifier                       |
| subscription | TEXT      | Doctor's subscription plan (nullable)          |
| permissions  | TEXT[]    | Array of secretary permissions (nullable)      |
| created_at   | TIMESTAMP | Account creation timestamp                     |
| updated_at   | TIMESTAMP | Last update timestamp                          |

## API Functions

### `signup({ email, password, userData })`
Creates a new user account in both Supabase Auth and the users table.

### `login({ email, password })`
Authenticates a user and returns session data.

### `logout()`
Signs out the current user.

### `getCurrentUser()`
Retrieves the current authenticated user with additional data from the users table.

### `verifyClinicId(clinicId)`
Verifies that a clinic ID exists and belongs to a doctor.

## Usage Examples

### Protected Routes
Routes are automatically protected using the `ProtectedRoute` component:
```jsx
<Route element={<ProtectedRoute><DoctorLayout /></ProtectedRoute>}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

### Using Auth Context
Access user data anywhere in the app:
```jsx
import { useAuth } from './features/auth/AuthContext'

function MyComponent() {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>
  
  return <div>Welcome, {user.full_name}!</div>
}
```

### Using Auth Hooks
```jsx
import useLogin from './features/auth/useLogin'

function LoginComponent() {
  const { mutate: login, isPending } = useLogin()
  
  const handleLogin = (data) => {
    login(data)
  }
}
```

## Security Features

1. **Row Level Security (RLS)**
   - Users can only read/update their own data
   - Doctors can view secretaries in their clinic
   - Secretaries can view doctors in their clinic

2. **Protected Routes**
   - Unauthenticated users are redirected to login
   - Authenticated users cannot access login/signup pages

3. **Email Verification**
   - Users receive a verification email after signup
   - Can be configured in Supabase settings

## Testing the System

### Test Doctor Registration
1. Go to `/signup`
2. Enter account details (email, password)
3. Enter personal info (name, phone)
4. Select "Doctor" as user type
5. Choose a subscription plan
6. Note the generated clinic ID
7. Complete registration

### Test Secretary Registration
1. Go to `/signup`
2. Enter account details
3. Enter personal info
4. Select "Secretary" as user type
5. Enter the doctor's clinic ID
6. Click "Verify" to validate
7. Complete registration

### Test Login
1. Go to `/login`
2. Enter registered email and password
3. Upon successful login, redirected to `/dashboard`

## Troubleshooting

### "Clinic ID not found" Error
- Ensure the clinic ID is entered correctly
- Verify that a doctor with this clinic ID exists
- Check that the doctor's account was created successfully

### Email Verification Issues
- Check Supabase email settings
- Verify SMTP configuration
- Check spam folder for verification emails

### RLS Policy Errors
- Ensure all policies are created correctly
- Check that the users table has RLS enabled
- Verify user ID matches auth.users.id

## Next Steps

1. **Implement Permission Management**
   - Create UI for doctors to manage secretary permissions
   - Add permission checking middleware

2. **Add Password Reset**
   - Implement forgot password functionality
   - Create password reset flow

3. **Enhance User Profile**
   - Add profile editing functionality
   - Allow users to update their information

4. **Add Role-Based UI**
   - Show/hide features based on user role
   - Create separate dashboards for doctors and secretaries

## Support

For issues or questions:
1. Check the Supabase documentation
2. Review the code comments
3. Verify environment variables are set correctly
4. Check browser console for errors
