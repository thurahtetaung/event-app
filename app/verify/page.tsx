"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState<string>("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    // Check for email in localStorage
    const verificationEmail = localStorage.getItem("verificationEmail")

    if (!verificationEmail) {
      toast.error("Please login or register first")
      router.push("/login")
      return
    }

    setEmail(verificationEmail)
  }, [router])

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Verification failed")
      }

      const result = await response.json()

      if (!result.token) {
        throw new Error("No token received from server")
      }

      // Update auth context with the new token
      await login(result.token)

      // Clear verification email
      localStorage.removeItem("verificationEmail")

      toast.success("Email verified successfully")
      router.push("/")
    } catch (error) {
      console.error("Verification error:", error)
      toast.error(error instanceof Error ? error.message : "Verification failed")
      setOtp("") // Clear OTP on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return

    setIsResending(true)
    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to resend OTP")
      }

      toast.success("New verification code sent")
      setResendTimer(60) // Start 60 second cooldown
      setOtp("") // Clear previous OTP
    } catch (error) {
      console.error("Resend OTP error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to resend verification code")
    } finally {
      setIsResending(false)
    }
  }

  // Format the timer display
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0
      ? `${mins}:${secs.toString().padStart(2, '0')}`
      : `${secs}s`
  }

  if (!email) {
    return null // Don't render anything while checking localStorage
  }

  return (
    <div className="container max-w-lg py-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            We sent a verification code to {email}. Please enter it below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="flex justify-center">
              <InputOTP
                value={otp}
                onChange={setOtp}
                maxLength={6}
                containerClassName="gap-2"
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Email
            </Button>
            <div className="text-center">
              <Button
                variant="link"
                type="button"
                onClick={handleResendOtp}
                disabled={isResending || resendTimer > 0}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendTimer > 0 ? (
                  `Resend code in ${formatTimer(resendTimer)}`
                ) : (
                  "Didn't receive the code? Send again"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}