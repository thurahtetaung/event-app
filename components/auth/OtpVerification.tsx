"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface OtpVerificationProps {
  email: string
  onVerify: (otp: string) => Promise<void>
  onResendOtp: () => Promise<void>
  isLoading: boolean
}

export function OtpVerification({
  email,
  onVerify,
  onResendOtp,
  isLoading,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

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

    try {
      await onVerify(otp)
    } catch (error) {
      setOtp("") // Clear OTP on error
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return

    setIsResending(true)
    try {
      await onResendOtp()
      toast.success("New verification code sent")
      setResendTimer(60) // Start 60 second cooldown
      setOtp("") // Clear previous OTP
    } catch (error) {
      console.error("Resend OTP error:", error)
    } finally {
      setIsResending(false)
    }
  }

  // Format the timer display
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground text-center">
        Enter the verification code sent to {email}
      </div>
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
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify Code
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
    </div>
  )
}