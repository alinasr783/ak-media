# Component Hierarchy Fix for Offline Mode

## Issue Identified

The `AutoPaymentRecorder` component was throwing an error:
```
Uncaught Error: useOffline must be used within an OfflineProvider
```

## Root Cause

The component hierarchy was incorrectly structured:

```
BrowserRouter
  AuthProviderWrapper
    AuthProvider
      AutoPaymentRecorder  <- Trying to use useOffline() here
    OfflineProvider        <- But OfflineProvider was rendered AFTER AutoPaymentRecorder
      OfflineIndicator
      Routes...
```

The `AutoPaymentRecorder` component was trying to use the `useOffline` hook before the `OfflineProvider` was mounted in the component tree.

## Solution Implemented

### 1. Restructured Component Hierarchy

Moved `AutoPaymentRecorder` to be rendered inside the `OfflineProvider`:

```
BrowserRouter
  AuthProviderWrapper
    AuthProvider
      OfflineProvider
        AutoPaymentRecorder  <- Now correctly inside OfflineProvider
        OfflineIndicator
        Routes...
```

### 2. Files Modified

#### `src/features/auth/AuthProviderWrapper.jsx`
- Removed `AutoPaymentRecorder` from this component
- Simplified to only wrap children with `AuthProvider`

#### `src/App.jsx`
- Added import for `AutoPaymentRecorder`
- Moved `AutoPaymentRecorder` to be rendered inside `OfflineProvider`
- Restored all missing imports that were accidentally removed

## Verification

- ✅ Development server starts without errors
- ✅ No more "useOffline must be used within an OfflineProvider" errors
- ✅ Component hierarchy is now correct
- ✅ AutoPaymentRecorder can access offline context
- ✅ All routes and functionality preserved

## Technical Details

The fix ensures proper React Context propagation by placing all components that need access to the offline context within the `OfflineProvider` boundary. This follows React's context rules where consumers must be descendants of providers in the component tree.

The new structure maintains all existing functionality while fixing the context access issue:
- Authentication context is still available through `AuthProvider`
- Offline context is now available through `OfflineProvider`
- Real-time payment recording works correctly both online and offline
- No breaking changes to existing routes or components