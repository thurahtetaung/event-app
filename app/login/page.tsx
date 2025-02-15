"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import LoginForm from "@/components/auth/LoginForm"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const from = searchParams.get("from")

  useEffect(() => {
    if (from) {
      toast.info("Please log in to continue", {
        description: "You need to be logged in to access this page.",
      })
    }
  }, [from])

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
          <a href="/terms" className="font-medium underline hover:text-primary">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="font-medium underline hover:text-primary">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}