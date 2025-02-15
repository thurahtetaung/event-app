"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StripeConnectButtonProps {
  isConnected?: boolean
  onConnectionChange?: (connected: boolean) => void
}

export default function StripeConnectButton({
  isConnected = false,
  onConnectionChange = () => {}
}: StripeConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [connected, setConnected] = useState(isConnected)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const success = searchParams.get("success")
    const hasShownToast = sessionStorage.getItem("stripe_connect_success")

    if (success === "true" && !hasShownToast) {
      sessionStorage.setItem("stripe_connect_success", "true")
      toast.success("Successfully connected to Stripe!")
      setConnected(true)
      onConnectionChange(true)

      const params = new URLSearchParams(searchParams.toString())
      params.delete("success")
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "")
      router.replace(newUrl)
    }
  }, [searchParams, onConnectionChange, router])

  const handleStripeConnect = async () => {
    setIsLoading(true)
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem("stripe_connect_success")
      }
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to connect to Stripe")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("Error connecting to Stripe:", error)
      toast.error("Failed to connect to Stripe")
      setConnected(false)
      onConnectionChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (connected) {
    return (
      <Button
        variant="outline"
        className={cn(
          "border-green-500/20 bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700",
          "dark:border-green-500/30 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30 dark:hover:text-green-300"
        )}
        disabled
      >
        <Check className="mr-2 h-4 w-4" />
        Connected to Stripe
      </Button>
    )
  }

  return (
    <Button onClick={handleStripeConnect} disabled={isLoading}>
      {isLoading ? "Connecting..." : "Connect with Stripe"}
    </Button>
  )
}

