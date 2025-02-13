"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function SettingsForm() {
  const [platformFee, setPlatformFee] = useState(2.5)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, you would send this data to your API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success("Settings updated successfully")
    } catch (error) {
      toast.error("Failed to update settings")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
          onChange={(e) => setPlatformFee(Number(e.target.value))}
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}