"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { MultiSelect } from "@/components/ui/multi-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import StripeConnectButton from "@/components/payments/StripeConnectButton"
import { apiClient, OrganizationData } from "@/lib/api-client"

const EVENT_TYPES = [
  { label: "Conferences & Seminars", value: "conference" },
  { label: "Classes & Workshops", value: "workshop" },
  { label: "Concerts & Performances", value: "concert" },
  { label: "Exhibitions & Trade Shows", value: "exhibition" },
  { label: "Sports & Fitness", value: "sports" },
  { label: "Networking & Social Events", value: "networking" },
  { label: "Festivals & Celebrations", value: "festival" },
  { label: "Corporate Events", value: "corporate" },
]

const ORGANIZATION_TYPES = [
  { label: "Company", value: "company" },
  { label: "Individual", value: "individual" },
  { label: "Non-Profit", value: "non_profit" },
]

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  organizationType: z.enum(["company", "individual", "non_profit"]),
  description: z.string().min(50, "Description must be at least 50 characters"),
  website: z.string().url().optional().or(z.literal("")),
  eventTypes: z.array(z.string()).min(1, "Select at least one event type"),
  phoneNumber: z.string().min(10, "Enter a valid phone number"),
  address: z.string().min(10, "Enter your complete address"),
  socialLinks: z.object({
    facebook: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
    linkedin: z.string().url().optional().or(z.literal("")),
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function OrganizerSettingsPage() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isResetting, setIsResetting] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      organizationType: "company",
      description: "",
      website: "",
      eventTypes: [] as string[],
      phoneNumber: "",
      address: "",
      socialLinks: {
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
      },
    },
  })

  // Set active tab from query param
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && ["profile", "payments"].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Fetch organization data
  async function fetchOrganization() {
    try {
      const data = await apiClient.organizations.getCurrent() as OrganizationData
      console.log("Raw organization data:", data)
      let eventTypes: string[] = []
      try {
        eventTypes = JSON.parse(data.eventTypes)
        console.log("Parsed event types:", eventTypes)
        if (!Array.isArray(eventTypes)) {
          console.log("Event types is not an array, resetting to empty array")
          eventTypes = []
        }
      } catch (e) {
        console.error('Error parsing event types:', e)
      }

      console.log("Setting form values with event types:", eventTypes)
      form.reset({
        name: data.name,
        organizationType: data.organizationType,
        description: data.description,
        website: data.website || "",
        eventTypes,
        phoneNumber: data.phoneNumber || "",
        address: data.address,
        socialLinks: data.socialLinks ? JSON.parse(data.socialLinks) : {
          facebook: "",
          instagram: "",
          twitter: "",
          linkedin: "",
        },
      }, {
        keepDefaultValues: false,
        keepDirtyValues: false,
      })
    } catch (error) {
      console.error("Error fetching organization:", error)
      toast.error("Failed to load organization data")
    } finally {
      setIsLoading(false)
      setIsResetting(false)
    }
  }

  useEffect(() => {
    fetchOrganization()
  }, [form])

  const handleReset = async () => {
    setIsResetting(true)
    await fetchOrganization()
    toast.success("Form reset to last saved values")
  }

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    try {
      await apiClient.organizations.update({
        ...values,
        eventTypes: JSON.stringify(values.eventTypes),
        socialLinks: JSON.stringify(values.socialLinks),
      })
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
            Manage your organization profile and preferences
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Organization Profile</CardTitle>
                <CardDescription>
                  Update your organization details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Your organization name"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="organizationType">Organization Type</Label>
                    <Select
                      defaultValue={form.watch("organizationType")}
                      onValueChange={(value) => form.setValue("organizationType", value as "company" | "individual" | "non_profit", { shouldValidate: true })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ORGANIZATION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.organizationType && (
                      <p className="text-sm text-destructive">{form.formState.errors.organizationType.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...form.register("description")}
                      placeholder="Describe your organization"
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      {...form.register("website")}
                      placeholder="https://example.com"
                    />
                    {form.formState.errors.website && (
                      <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label>Event Types</Label>
                    <MultiSelect
                      options={EVENT_TYPES}
                      value={form.watch("eventTypes")}
                      onValueChange={(selected) => {
                        console.log("MultiSelect onValueChange - selected:", selected)
                        console.log("Current form event types:", form.getValues("eventTypes"))
                        form.setValue("eventTypes", selected, { shouldValidate: true })
                      }}
                      placeholder="Select event types"
                      variant="outline"
                    />
                    {form.formState.errors.eventTypes && (
                      <p className="text-sm text-destructive">{form.formState.errors.eventTypes.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Update your contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      {...form.register("phoneNumber")}
                      placeholder="+1234567890"
                    />
                    {form.formState.errors.phoneNumber && (
                      <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      {...form.register("address")}
                      placeholder="Your organization's address"
                    />
                    {form.formState.errors.address && (
                      <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>
                  Connect your social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      type="url"
                      {...form.register("socialLinks.facebook")}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      type="url"
                      {...form.register("socialLinks.instagram")}
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      type="url"
                      {...form.register("socialLinks.twitter")}
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      {...form.register("socialLinks.linkedin")}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isLoading || isResetting}
              >
                {isResetting ? "Resetting..." : "Undo Changes"}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
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
      </Tabs>
    </div>
  )
}