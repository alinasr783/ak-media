# Subscription Expiration Feature

## Overview
This feature implements subscription expiration handling for the Tabibi medical clinic management system. When a user's subscription expires, certain pages will display a popup instead of their normal content.

## How It Works

### 1. Subscription Expiry Check
The system uses a custom hook `useSubscriptionExpiry` that:
- Fetches the current user's subscription data using `getCurrentPlan`
- Calculates the number of days remaining until subscription expiration
- Determines if the subscription has already expired (days remaining < 0)

### 2. Restricted Pages
When a subscription expires, the following pages are restricted:
- Appointments (`/appointments`)
- Patients (`/patients`)
- Treatments (`/treatments`)
- Electronic Bookings (`/online-booking`)
- Finance (`/finance`)
- Notifications (`/notifications`)

All detail pages under these routes are also restricted (e.g., `/patients/123`, `/appointments/456`).

### 3. Popup Display
When accessing a restricted page with an expired subscription:
- A modal popup appears showing expiration details within the page content area
- The original page content is dimmed and disabled with a blur effect
- Users can still navigate using the sidebar menu
- Users can either:
  - Renew their subscription (navigates to `/subscriptions`)
  - Contact support via WhatsApp

## Implementation Details

### Components
1. **`useSubscriptionExpiry.js`** - Custom hook to check subscription status
2. **`SubscriptionExpiryPopup.jsx`** - Popup component showing expiration details
3. **`SubscriptionExpiryGuard.jsx`** - Higher-order component wrapping restricted pages
4. **Route modifications in `App.jsx`** - Wrapped restricted routes with the guard

### Key Features
- Real-time expiration checking using React Query
- Proper handling of detail pages (e.g., patient details, appointment details)
- WhatsApp integration for customer support
- Responsive design that works on all screen sizes
- Arabic language support
- Popup appears within page content area (not fullscreen)
- Sidebar navigation remains accessible
- Blur effect on background content

## Testing
A test page is available at `/test-subscription` to verify the subscription expiry functionality.

## Customization
To modify the support phone number:
1. Edit `SubscriptionExpiryPopup.jsx`
2. Update the `phoneNumber` variable with the actual support number

To modify restricted pages:
1. Edit `SubscriptionExpiryGuard.jsx`
2. Update the `RESTRICTED_PAGES` array

## Error Handling
- If there's an error checking subscription status, the system assumes no expiration issue
- All errors are logged to the console for debugging