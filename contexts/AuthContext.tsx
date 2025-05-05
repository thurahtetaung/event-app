"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Cookies from 'js-cookie'
import { apiClient, type ApiError } from "@/lib/api-client" // Import apiClient and ApiError

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
  const [loginRedirectPath, setLoginRedirectPath] = useState<string | null>(null); // New state for redirect path
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialLoadComplete = useRef(false)

  const fetchUser = useCallback(async () => {
    console.log(`[AuthContext] fetchUser called. InitialLoadComplete: ${initialLoadComplete.current}`); // Log start + initialLoadComplete
    const token = Cookies.get("token")
    if (!token) {
      console.log("[AuthContext] fetchUser: No token found."); // Log no token
      if (initialLoadComplete.current) {
        setUser(null)
      }
      setLoading(false)
      return
    }

    console.log("[AuthContext] fetchUser: Token found, attempting to fetch user."); // Log fetch attempt
    try {
      const userData = await apiClient.auth.getCurrentUser() as User;
      console.log("[AuthContext] fetchUser: Successfully fetched user:", userData); // Log success
      setUser(userData)
      setError(null)
      initialLoadComplete.current = true
    } catch (error) {
      console.error("[AuthContext] fetchUser: Error fetching user data:", error); // Log error
      const apiError = error as ApiError
      let errorMessage = "Failed to fetch user data. Please try logging in again."
      if (apiError.status === 401) {
        errorMessage = "Session expired. Please log in again."
      } else if (apiError.message) {
        errorMessage = apiError.message
      }

      if (initialLoadComplete.current || apiError.status === 401) {
        console.log("[AuthContext] fetchUser: *** About to set user to null due to fetch error ***"); // Log before setting user to null
        console.log("[AuthContext] fetchUser: Setting error and clearing user due to fetch error."); // Log error handling
        setError(errorMessage)
        setUser(null)
        Cookies.remove("token")
        Cookies.remove("refreshToken")
        if (apiError.status === 401) {
          console.log("[AuthContext] fetchUser: Redirecting to /login due to 401."); // Log 401 redirect
          router.push("/login")
        }
      }
    } finally {
      console.log("[AuthContext] fetchUser: Setting loading to false."); // Log finally block
      if (!initialLoadComplete.current) {
        initialLoadComplete.current = true
      }
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    console.log("[AuthContext] Initial useEffect running (the one that calls fetchUser)."); // Log initial effect run
    const token = Cookies.get("token")
    if (!token) {
      console.log("[AuthContext] Initial useEffect: No token, setting loading false."); // Log no token in initial effect
      setLoading(false)
      initialLoadComplete.current = true
      return
    }
    console.log("[AuthContext] Initial useEffect: Token found, calling fetchUser."); // Log calling fetchUser
    fetchUser()
  }, [fetchUser])

  // New useEffect to handle navigation after login state is set
  useEffect(() => {
    if (loginRedirectPath) {
      console.log(`[AuthContext] useEffect detected loginRedirectPath: ${loginRedirectPath}. Navigating...`);
      router.push(loginRedirectPath);
      setLoginRedirectPath(null); // Reset after navigation
    }
  }, [loginRedirectPath, router]);

  const login = async (token: string, refreshToken: string) => {
    setLoading(true)
    setError(null)
    let finalRedirectPath = "/";

    try {
      if (!token || !refreshToken) {
        console.error("Missing tokens:", { token: !!token, refreshToken: !!refreshToken })
        throw new Error("No tokens provided")
      }

      console.log("Setting cookies...")
      Cookies.set("token", token, {
        expires: 1,
        path: "/",
        sameSite: "lax",
      })
      Cookies.set("refreshToken", refreshToken, {
        expires: 2,
        path: "/",
        sameSite: "lax",
      })

      console.log("[AuthContext] Fetching user data after login...");
      const loggedInUser = await apiClient.auth.getCurrentUser() as User;
      console.log("[AuthContext] Fetched user data:", loggedInUser);
      setUser(loggedInUser)
      setError(null)

      // Determine redirect path based on role
      let redirectPath = "/"
      if (loggedInUser.role === "admin") {
        redirectPath = "/admin/dashboard"
      } else if (loggedInUser.role === "organizer") {
        redirectPath = "/organizer/dashboard"
      }
      console.log(`[AuthContext] Determined default redirect path based on role '${loggedInUser.role}': ${redirectPath}`);

      // Check for 'from' parameter
      const from = searchParams.get("from")
      finalRedirectPath = from || redirectPath; // Assign to the outer variable
      console.log(`[AuthContext] 'from' param: ${from}, Initial finalRedirectPath: ${finalRedirectPath}`);

      // Ensure 'from' path is appropriate for the user's role
      if (from) {
        if (from.startsWith('/admin') && loggedInUser.role !== 'admin') {
          console.log(`[AuthContext] Overriding 'from' (${from}) because user role (${loggedInUser.role}) is not admin.`);
          finalRedirectPath = redirectPath;
        } else if (from.startsWith('/organizer') && loggedInUser.role !== 'organizer') { // Adjusted check for organizer
          console.log(`[AuthContext] Overriding 'from' (${from}) because user role (${loggedInUser.role}) is not organizer.`);
          finalRedirectPath = redirectPath;
        }
      }

      // toast.success("Successfully logged in!")
    } catch (error) {
      const apiError = error as ApiError
      const errorMessage = apiError?.message || "Login failed. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
      Cookies.remove("token")
      Cookies.remove("refreshToken")
      setUser(null)
    } finally {
      setLoading(false)
      if (!error && finalRedirectPath) { // Check error state and if path was determined
        console.log(`[AuthContext] Finally block: Setting loginRedirectPath to ${finalRedirectPath}`);
        // Instead of router.push, set the state to trigger the useEffect
        setLoginRedirectPath(finalRedirectPath);
      }
    }
  }

  const logout = async () => {
    try {
      console.log("Logging out")
      // Redirect directly to login page first
      router.push("/login") // Change redirect target to /login
      router.refresh()

      // Then clear state and cookies
      Cookies.remove("token")
      Cookies.remove("refreshToken")
      setUser(null)
      setError(null)

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