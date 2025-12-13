import { createContext, useContext, useMemo } from "react"
import useUser from "./useUser"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const { data: user, isLoading } = useUser()
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    isLoading
  }), [user, isLoading])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}