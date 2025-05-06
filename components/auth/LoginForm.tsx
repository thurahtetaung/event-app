"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { OtpVerification } from "./OtpVerification"
import { apiClient } from "@/lib/api-client"

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
      await apiClient.auth.login(email)
      setShowOtpInput(true)
      toast.success("OTP sent to your email")
    } catch (error: any) {
      console.error("Login error:", error)

      // Handle account status errors specifically
      if (error.status === 403) {
        // This is for inactive or banned users
        toast.error(error.message || "Access denied")
        setShowOtpInput(false)
        return
      }

      // Check for registration pending errors with more flexible detection
      if (
        error.message?.includes("complete your registration") ||
        error.message?.includes("REGISTRATION_PENDING") ||
        (typeof error.message === 'string' && error.message.toLowerCase().includes("verify your email"))
      ) {
        setIsCompletingRegistration(true)
        setShowOtpInput(true)
        toast.success("Please verify your email to complete registration")
        return
      }
      if (!isCompletingRegistration) {
        setShowOtpInput(false)
      }
      toast.error(error.message || "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    setIsLoading(true)
    try {
      const response = isCompletingRegistration
        ? await apiClient.auth.verifyRegistration(email, otp)
        : await apiClient.auth.verifyLogin(email, otp)

      // Type-safe access to response properties
      console.log('Auth response received:', response);

      // Type guard to check if response has the expected structure
      if (response && typeof response === 'object' && 'data' in response) {
        const responseData = response.data as { access_token?: string; refresh_token?: string };
        const accessToken = responseData?.access_token;
        const refreshToken = responseData?.refresh_token;

        if (!accessToken || !refreshToken) {
          console.error('Missing tokens in response:', responseData);
          toast.error("Authentication error: Invalid token response");
          return;
        }

        await login(accessToken, refreshToken);
        toast.success(isCompletingRegistration ? "Registration completed successfully!" : "Login successful")
        router.push("/")
      } else {
        console.error('Invalid response format:', response);
        toast.error("Authentication error: Unexpected response format");
      }
    } catch (error: unknown) {
      console.error("Verification error details:", error);

      // Type guard for error object
      if (error && typeof error === 'object' && 'status' in error && error.status === 403) {
        toast.error(
          'message' in error && typeof error.message === 'string'
            ? error.message
            : "Access denied"
        )
        setShowOtpInput(false)
        return
      }

      toast.error(
        error instanceof Error ? error.message : "Invalid OTP"
      )
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      await apiClient.auth.resendOTP(email, isCompletingRegistration ? 'registration' : 'login')
      toast.success("New verification code sent")
    } catch (error: any) {
      // Handle account status errors during resend
      if (error.status === 403) {
        toast.error(error.message || "Access denied")
        setShowOtpInput(false)
        return
      }

      toast.error(error.message || "Failed to resend OTP")
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

