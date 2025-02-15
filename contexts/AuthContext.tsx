"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  role: "admin" | "organizer" | "user"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/me")
      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired
          setUser(null)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const userData: User = await response.json()
      setUser(userData)
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Failed to fetch user data. Please try logging in again.")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (token: string) => {
    setLoading(true)
    setError(null)
    try {
      // Set the token in an HTTP-only cookie via API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      await fetchUser()

      // Get the redirect path from URL or default to root
      const from = searchParams.get("from") || "/"
      router.push(from)
      router.refresh()

      toast.success("Successfully logged in!")
    } catch (error) {
      console.error("Error during login:", error)
      setError("Login failed. Please try again.")
      toast.error("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Clear the cookie via API
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      setError(null)
      router.push("/")
      router.refresh()
      toast.success("Successfully logged out!")
    } catch (error) {
      console.error("Error during logout:", error)
      toast.error("Failed to logout. Please try again.")
    }
  }

  return <AuthContext.Provider value={{ user, loading, error, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

