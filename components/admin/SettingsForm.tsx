"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"

export function SettingsForm() {
  const [platformFee, setPlatformFee] = useState<number | "">("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUsingDefaultValue, setIsUsingDefaultValue] = useState(false)
  const defaultFeeValue = 2.5

  // Fetch current platform fee on component mount
  useEffect(() => {
    const fetchPlatformFee = async () => {
      setIsInitialLoading(true)
      setError(null)

      try {
        const response = await apiClient.platformConfigurations.getByKey('platform_fee')
        // Convert string value to number
        setPlatformFee(parseFloat(response.value))
        setIsUsingDefaultValue(false)
      } catch (err: any) {
        // If platform_fee doesn't exist yet
        if (err.error?.message?.includes('not found')) {
          setPlatformFee(defaultFeeValue) // Default value
          setIsUsingDefaultValue(true)

          // Optionally, automatically create the platform fee configuration
          // Uncomment the following code if you want to auto-create it
          /*
          try {
            await apiClient.platformConfigurations.create({
              key: 'platform_fee',
              value: defaultFeeValue.toString()
            })
            toast.success("Default platform fee has been set")
            setIsUsingDefaultValue(false)
          } catch (createErr: any) {
            console.error('Error creating default platform fee:', createErr)
          }
          */
        } else {
          const errorMessage = err.error?.message || err.message || 'Failed to fetch platform fee'
          setError(errorMessage)
          console.error('Error fetching platform fee:', err)
        }
      } finally {
        setIsInitialLoading(false)
      }
    }

    fetchPlatformFee()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (platformFee === "") {
      toast.error("Please enter a valid platform fee")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Check if platform_fee exists by trying to fetch it
      try {
        await apiClient.platformConfigurations.getByKey('platform_fee')
        // If it exists, update it
        await apiClient.platformConfigurations.update('platform_fee', platformFee.toString())
      } catch (err: any) {
        // If it doesn't exist, create it
        if (err.error?.message?.includes('not found')) {
          await apiClient.platformConfigurations.create({
            key: 'platform_fee',
            value: platformFee.toString()
          })
        } else {
          throw err // Re-throw if it's a different error
        }
      }

      toast.success("Platform fee updated successfully")
      setIsUsingDefaultValue(false)
    } catch (error: any) {
      const errorMessage = error.error?.message || error.message || 'Failed to update platform fee'
      setError(errorMessage)
      toast.error("Failed to update platform fee")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isUsingDefaultValue && (
        <Alert variant="default" className="bg-muted">
          <Info className="h-4 w-4" />
          <AlertTitle>Default Value</AlertTitle>
          <AlertDescription>
            This default platform fee ({defaultFeeValue}%) has not been saved yet.
            Please click "Save Changes" to set this as your platform fee.
          </AlertDescription>
        </Alert>
      )}

      {isInitialLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platformFee">Platform Fee (%)</Label>
            <Input
              id="platformFee"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={platformFee}
              onChange={(e) => setPlatformFee(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || platformFee === ""}
            className={isUsingDefaultValue ? "animate-pulse" : ""}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              isUsingDefaultValue ? "Save Default Value" : "Save Changes"
            )}
          </Button>
        </form>
      )}
    </div>
  )
}