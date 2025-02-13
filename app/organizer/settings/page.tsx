"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import StripeConnectButton from "@/components/payments/StripeConnectButton"

// Mock data - replace with API call
const organizer = {
  name: "John Doe",
  email: "john@example.com",
  organization: "Tech Events Inc",
  phone: "+1234567890",
  notificationSettings: {
    emailNotifications: true,
    eventUpdates: true,
    marketingEmails: false,
  }
}

export default function OrganizerSettingsPage() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState(organizer)
  const [activeTab, setActiveTab] = useState("profile")

  // Set active tab from query param
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["profile", "payments", "notifications"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // In a real app, make API call here
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your organizer profile and preferences
          </p>
        </div>
        {activeTab !== "payments" && (
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your organizer profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    defaultValue={formData.name}
                    placeholder="Your name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={formData.email}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    defaultValue={formData.organization}
                    placeholder="Your organization name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue={formData.phone}
                    placeholder="Your phone number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Connect your Stripe account to receive payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-4 rounded-lg border p-4">
                  <div>
                    <h4 className="font-medium">Stripe Connect Status</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect your Stripe account to start receiving payments for your events
                    </p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Connect your Stripe account to receive payments from ticket sales
                      </p>
                    </div>
                    <StripeConnectButton />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch
                    checked={formData.notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        notificationSettings: {
                          ...formData.notificationSettings,
                          emailNotifications: checked,
                        },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Event Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about event-related activities
                    </p>
                  </div>
                  <Switch
                    checked={formData.notificationSettings.eventUpdates}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        notificationSettings: {
                          ...formData.notificationSettings,
                          eventUpdates: checked,
                        },
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and promotions
                    </p>
                  </div>
                  <Switch
                    checked={formData.notificationSettings.marketingEmails}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        notificationSettings: {
                          ...formData.notificationSettings,
                          marketingEmails: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}