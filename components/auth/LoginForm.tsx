"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { OtpVerification } from "./OtpVerification"
import { apiClient } from "@/lib/api-client"

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
      await apiClient.auth.login(email)
      setShowOtpInput(true)
      toast.success("OTP sent to your email")
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.message?.includes("complete your registration")) {
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

      // Debug information - check token structure
      console.log('Auth response structure:', Object.keys(response));

      // The tokens are nested in response.data for this API
      const accessToken = response.data?.access_token;
      const refreshToken = response.data?.refresh_token;

      if (!accessToken || !refreshToken) {
        console.error('Missing tokens in response:', response);
        toast.error("Authentication error: Invalid token response");
        return;
      }

      await login(accessToken, refreshToken);
      toast.success(isCompletingRegistration ? "Registration completed successfully!" : "Login successful")
      router.push("/")
    } catch (error: any) {
      console.error("Verification error details:", error);
      toast.error(error.message || "Invalid OTP")
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

