"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { OtpVerification } from "./OtpVerification"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [isCompletingRegistration, setIsCompletingRegistration] = useState(false)
  const { login } = useAuth()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.message?.includes("complete your registration")) {
          setIsCompletingRegistration(true)
          setShowOtpInput(true)
          toast.success("Please verify your email to complete registration")
          return
        }
        throw new Error(data.message || "Failed to send OTP")
      }

      setShowOtpInput(true)
      toast.success("OTP sent to your email")
    } catch (error) {
      console.error("Login error:", error)
      if (!isCompletingRegistration) {
        setShowOtpInput(false)
      }
      toast.error(error instanceof Error ? error.message : "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    setIsLoading(true)
    try {
      const endpoint = isCompletingRegistration ? "verifyRegistration" : "verifyLogin"
      const response = await fetch(`${API_URL}/api/users/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP")
      }

      // Extract tokens based on response structure
      const { access_token, refresh_token } = isCompletingRegistration
        ? data
        : data.data

      if (!access_token || !refresh_token) {
        throw new Error("Invalid token response")
      }

      await login(access_token, refresh_token)
      toast.success(isCompletingRegistration ? "Registration completed successfully!" : "Login successful")
      router.push("/")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid OTP")
      console.error(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      const endpoint = isCompletingRegistration ? "resendRegistrationOTP" : "login"
      const response = await fetch(`${API_URL}/api/users/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP")
      }

      toast.success("New verification code sent")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend OTP")
      throw error
    }
  }

  return (
    <div className="space-y-4">
      {!showOtpInput ? (
        <form onSubmit={handleSendOtp}>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email}
            >
              {isLoading ? "Loading..." : "Continue with Email"}
            </Button>
          </div>
        </form>
      ) : (
        <>
          <OtpVerification
            email={email}
            onVerify={handleVerifyOtp}
            onResendOtp={handleResendOtp}
            isLoading={isLoading}
          />
          <Button
            variant="link"
            className="w-full"
            onClick={() => setShowOtpInput(false)}
            disabled={isLoading}
          >
            Use a different email
          </Button>
        </>
      )}
    </div>
  )
}

