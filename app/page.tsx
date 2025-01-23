"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Ticket, Mail, LockKeyhole } from "lucide-react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const APP_CONTENT = {
  title: "Event App",
  subtitle: "Your gateway to unforgettable experiences",
  features: [
    {
      icon: Calendar,
      title: "Discover exciting events",
      description: "Find and attend events that match your interests",
    },
    {
      icon: Ticket,
      title: "Easy ticket booking",
      description: "Book tickets seamlessly with just a few clicks",
    },
    {
      icon: Mail,
      title: "Secure email OTP login",
      description: "Quick and secure authentication process",
    },
    {
      icon: LockKeyhole,
      title: "One-click Google sign-in",
      description: "Alternative secure authentication option",
    },
  ],
  auth: {
    email: {
      label: "Email",
      placeholder: "hello@example.com",
      invalidMessage: "Please enter a valid email address",
      sendButton: {
        default: "Send OTP",
        loading: "Sending...",
      },
    },
    username: {
      label: "Username",
      placeholder: "johndoe",
      invalidMessage: "Username must be at least 3 characters",
    },
    otp: {
      label: "Enter OTP sent to",
      verifyButton: {
        default: "Verify OTP",
        loading: "Verifying...",
      },
      resend: {
        countdown: "Resend OTP in {time}",
        button: "Resend OTP",
        loading: "Sending...",
      },
      invalidMessage: "Please enter a complete OTP",
    },
    modes: {
      login: "Login",
      signup: "Sign Up",
    },
    divider: "OR CONTINUE WITH",
    google: {
      button: "Sign {mode} with Google",
    },
    legal: {
      text: "By continuing, you agree to our",
      links: {
        terms: "Terms of Service",
        privacy: "Privacy Policy",
      },
    },
  },
  toasts: {
    invalidEmail: {
      title: "Invalid email",
      description: "Please enter a valid email address",
    },
    otpSent: {
      title: "Success",
      description: "OTP sent successfully!",
    },
    otpSendError: {
      title: "Error",
      description: "Failed to send OTP. Please try again.",
    },
    invalidOtp: {
      title: "Invalid OTP",
      description: "Please enter a complete OTP",
    },
    otpVerified: {
      title: "Success",
      description: "OTP verified successfully!",
    },
    otpVerifyError: {
      title: "Error",
      description: "Invalid OTP. Please try again.",
    },
    invalidUsername: {
      title: "Invalid username",
      description: "Username must be at least 3 characters",
    },
  },
} as const

const COUNTDOWN_DURATION = 30 // seconds

export default function HomePage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [otp, setOtp] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0 && isOtpSent) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown, isOtpSent])

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }

  const handleSendOTP = async () => {
    if (authMode === "signup" && (!username || username.length < 3)) {
      toast({
        ...APP_CONTENT.toasts.invalidUsername,
        variant: "destructive",
      })
      return
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        ...APP_CONTENT.toasts.invalidEmail,
        variant: "destructive",
      })
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsOtpSent(true)
      setCountdown(COUNTDOWN_DURATION)
      toast({
        ...APP_CONTENT.toasts.otpSent,
        variant: "default",
      })
    } catch {
      toast({
        ...APP_CONTENT.toasts.otpSendError,
        variant: "destructive",
      })
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)
    try {
      await handleSendOTP()
      setCountdown(COUNTDOWN_DURATION)
    } finally {
      setIsResending(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        ...APP_CONTENT.toasts.invalidOtp,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        ...APP_CONTENT.toasts.otpVerified,
        variant: "default",
      })
      // Handle successful verification (e.g., redirect to dashboard)
    } catch {
      toast({
        ...APP_CONTENT.toasts.otpVerifyError,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl grid md:grid-cols-2 p-0 overflow-hidden">
        {/* Left Panel - Features */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-8 text-white space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{APP_CONTENT.title}</h1>
            <p className="text-lg opacity-90">{APP_CONTENT.subtitle}</p>
          </div>

          <div className="space-y-6">
            {APP_CONTENT.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4">
                <feature.icon className="h-8 w-8" />
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="opacity-75">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="p-8 flex flex-col bg-white">
          {/* Auth Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg mb-6">
            {(["login", "signup"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => !isOtpSent && setAuthMode(mode)}
                className={`py-2 px-4 rounded-md transition-colors ${
                  authMode === mode
                    ? "bg-white shadow-sm"
                    : "hover:bg-white/50"
                } ${isOtpSent ? "cursor-not-allowed opacity-50" : ""}`}
                disabled={isOtpSent}
              >
                {APP_CONTENT.auth.modes[mode]}
              </button>
            ))}
          </div>

          <div className="flex-1">
            {!isOtpSent ? (
              <div className="space-y-4">
                {authMode === "signup" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {APP_CONTENT.auth.username.label}
                    </label>
                    <Input
                      type="text"
                      placeholder={APP_CONTENT.auth.username.placeholder}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {APP_CONTENT.auth.email.label}
                  </label>
                  <Input
                    type="email"
                    placeholder={APP_CONTENT.auth.email.placeholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                >
                  {isLoading
                    ? APP_CONTENT.auth.email.sendButton.loading
                    : APP_CONTENT.auth.email.sendButton.default}
                </Button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      {APP_CONTENT.auth.divider}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Handle Google Sign In
                  }}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {APP_CONTENT.auth.google.button.replace(
                    "{mode}",
                    authMode === "login" ? "in" : "up"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      {APP_CONTENT.auth.otp.label} {email}
                    </label>
                    <button
                      onClick={() => {
                        setIsOtpSent(false)
                        setOtp("")
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit email
                    </button>
                  </div>
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={isLoading}
                  >
                    <InputOTPGroup className="w-full gap-2">
                      <InputOTPSlot className="flex-1 rounded-md border h-10" index={0} />
                      <InputOTPSlot className="flex-1 rounded-md border h-10" index={1} />
                      <InputOTPSlot className="flex-1 rounded-md border h-10" index={2} />
                      <InputOTPSlot className="flex-1 rounded-md border h-10" index={3} />
                      <InputOTPSlot className="flex-1 rounded-md border h-10" index={4} />
                      <InputOTPSlot className="flex-1 rounded-md border h-10" index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  onClick={handleVerifyOTP}
                  disabled={isLoading}
                >
                  {isLoading
                    ? APP_CONTENT.auth.otp.verifyButton.loading
                    : APP_CONTENT.auth.otp.verifyButton.default}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  {countdown > 0 ? (
                    <p>
                      {APP_CONTENT.auth.otp.resend.countdown.replace(
                        "{time}",
                        formatCountdown(countdown)
                      )}
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      className="text-blue-600 hover:underline disabled:opacity-50 disabled:hover:no-underline"
                      disabled={isResending}
                    >
                      {isResending
                        ? APP_CONTENT.auth.otp.resend.loading
                        : APP_CONTENT.auth.otp.resend.button}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground mt-6">
            <p>{APP_CONTENT.auth.legal.text}</p>
            <div className="space-x-1">
              <a href="#" className="text-blue-600 hover:underline">
                {APP_CONTENT.auth.legal.links.terms}
              </a>
              <span>&</span>
              <a href="#" className="text-blue-600 hover:underline">
                {APP_CONTENT.auth.legal.links.privacy}
              </a>
            </div>
          </div>
        </div>
      </Card>
    </main>
  )
}
