"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  country: string
  role: "admin" | "organizer" | "user"
  verified: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to get token from cookie
const getStoredToken = () => {
  if (typeof window === "undefined") return null
  const token = Cookies.get("token")
  return token
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Debug log for user state changes
  useEffect(() => {
  }, [user, loading, error])

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    const token = getStoredToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove("token")
          setUser(null)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const userData = await response.json()
      setUser(userData)
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Failed to fetch user data. Please try logging in again.")
      setUser(null)
      Cookies.remove("token")
    } finally {
      setLoading(false)
    }
  }

  const login = async (token: string) => {
    setLoading(true)
    setError(null)
    try {
      if (!token) {
        throw new Error("No token provided")
      }
      // Set token in cookie with HTTP-only flag
      Cookies.set("token", token, {
        expires: 7, // 7 days
        path: "/",
        sameSite: "lax",
      })
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
      Cookies.remove("token")
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log("Logging out")
      Cookies.remove("token")
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