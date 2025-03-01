"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import LoginForm from "@/components/auth/LoginForm"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const { user, login } = useAuth()
  const from = searchParams.get("from")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [verifying, setVerifying] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const redirectTo = from || "/"
      router.push(redirectTo)
    }
  }, [from])

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifying(true)
    try {
      const response = await apiClient.auth.verifyLogin(email, otp) as {
        access_token: string;
        refresh_token: string;
      }
      await login(response.access_token, response.refresh_token)
    } catch (error) {
      console.error("Error verifying OTP:", error)
      toast.error("Failed to verify OTP. Please try again.")
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="mx-auto w-full max-w-[350px] space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign in to continue
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to receive a one-time password.
          </p>
        </div>
        <LoginForm />
        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="font-medium underline hover:text-primary">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium underline hover:text-primary">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}