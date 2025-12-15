import { createContext, useContext, useMemo } from "react"
import useUser from "./useUser"
import { logout as apiLogout } from "../../services/apiAuth"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const { data: user, isLoading } = useUser()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  
  // Logout function
  const logout = async () => {
    try {
      await apiLogout()
      // Clear all queries to reset app state
      queryClient.clear()
      // Redirect to landing page
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    isLoading,
    logout
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