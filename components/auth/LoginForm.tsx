"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showOtpInput, setShowOtpInput] = useState(false)
  const { login } = useAuth()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) throw new Error("Failed to send OTP")

      setShowOtpInput(true)
      toast.success("OTP sent to your email")
    } catch (error) {
      toast.error("Failed to send OTP")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !otp) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      if (!response.ok) throw new Error("Invalid OTP")

      const { token } = await response.json()
      await login(token)
    } catch (error) {
      toast.error("Invalid OTP")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp}>
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || showOtpInput}
            required
          />
          {showOtpInput && (
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={isLoading}
              required
            />
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !email || (showOtpInput && !otp)}
          >
            {isLoading
              ? "Loading..."
              : showOtpInput
              ? "Verify OTP"
              : "Send Login Link"}
          </Button>
        </div>
      </form>
      {showOtpInput && (
        <Button
          variant="link"
          className="w-full"
          onClick={() => setShowOtpInput(false)}
          disabled={isLoading}
        >
          Use a different email
        </Button>
      )}
    </div>
  )
}

