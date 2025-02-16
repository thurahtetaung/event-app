"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
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
  login: (token: string, refreshToken: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Add mutex for token refresh
  const refreshTokenPromise = useRef<Promise<any> | null>(null)
  const initialLoadComplete = useRef(false)

  useEffect(() => {
    // Check for token immediately
    const token = Cookies.get("token")
    if (!token) {
      setLoading(false)
      initialLoadComplete.current = true
      return
    }
    fetchUser()
  }, [])

  const refreshTokenIfNeeded = async () => {
    try {
      // If already refreshing, wait for that to complete
      if (refreshTokenPromise.current) {
        return refreshTokenPromise.current
      }

      const refreshToken = Cookies.get("refreshToken")
      if (!refreshToken) {
        throw new Error("No refresh token available")
      }

      setIsRefreshing(true)
      // Create new promise for this refresh attempt
      refreshTokenPromise.current = fetch(`${API_URL}/api/users/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to refresh token")
        }
        const data = await response.json()
        Cookies.set("token", data.access_token, {
          expires: 1,
          path: "/",
          sameSite: "lax",
        })
        Cookies.set("refreshToken", data.refresh_token, {
          expires: 2,
          path: "/",
          sameSite: "lax",
        })
        return data
      })

      await refreshTokenPromise.current
      return true
    } catch (error) {
      console.error("Error refreshing token:", error)
      // Only clear user state if this is not an initial load
      if (initialLoadComplete.current) {
        Cookies.remove("token")
        Cookies.remove("refreshToken")
        setUser(null)
        router.push("/login")
      }
      throw error
    } finally {
      setIsRefreshing(false)
      refreshTokenPromise.current = null
    }
  }

  const fetchUser = async (retried = false) => {
    const token = Cookies.get("token")
    if (!token) {
      if (initialLoadComplete.current) {
        setUser(null)
      }
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401 && !retried) {
          // Try to refresh the token
          await refreshTokenIfNeeded()
          // Retry the request with the new token
          return fetchUser(true)
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const userData = await response.json()
      setUser(userData)
      initialLoadComplete.current = true
    } catch (error) {
      console.error("Error fetching user data:", error)
      if (initialLoadComplete.current) {
        setError("Failed to fetch user data. Please try logging in again.")
        setUser(null)
        Cookies.remove("token")
        Cookies.remove("refreshToken")
        router.push("/login")
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (token: string, refreshToken: string) => {
    setLoading(true)
    setError(null)
    try {

      if (!token || !refreshToken) {
        console.error("Missing tokens:", { token: !!token, refreshToken: !!refreshToken })
        throw new Error("No tokens provided")
      }

      console.log("Setting cookies...")
      // Set tokens in cookies
      Cookies.set("token", token, {
        expires: 1, // 1 day
        path: "/",
        sameSite: "lax",
      })
      Cookies.set("refreshToken", refreshToken, {
        expires: 2, // 2 days
        path: "/",
        sameSite: "lax",
      })

      console.log("Fetching user data...")
      await fetchUser()
      // Get the redirect path from URL or default to root
      const from = searchParams.get("from") || "/"
      router.push(from)
      router.refresh()

      toast.success("Successfully logged in!")
    } catch (error) {
      setError("Login failed. Please try again.")
      toast.error("Login failed. Please try again.")
      Cookies.remove("token")
      Cookies.remove("refreshToken")
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log("Logging out")
      Cookies.remove("token")
      Cookies.remove("refreshToken")
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