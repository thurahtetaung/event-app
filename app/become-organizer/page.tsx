"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

const EVENT_TYPES = [
  { id: "conference", label: "Conferences & Seminars" },
  { id: "workshop", label: "Classes & Workshops" },
  { id: "concert", label: "Concerts & Performances" },
  { id: "exhibition", label: "Exhibitions & Trade Shows" },
  { id: "sports", label: "Sports & Fitness" },
  { id: "networking", label: "Networking & Social Events" },
  { id: "festival", label: "Festivals & Celebrations" },
  { id: "corporate", label: "Corporate Events" },
] as const

const formSchema = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  organizationType: z.enum(["company", "individual", "non_profit"]),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().min(50, "Please provide a detailed description (minimum 50 characters)"),
  experience: z.string().min(30, "Please describe your experience (minimum 30 characters)"),
  eventTypes: z.array(z.string()).min(1, "Please select at least one event type"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please enter your complete address"),
  socialLinks: z.object({
    facebook: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    instagram: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    twitter: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    linkedin: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function BecomeOrganizerPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationType: "individual",
      website: "",
      eventTypes: [],
      socialLinks: {
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
      },
    },
  })

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      // In a real app, submit to your API
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success("Application submitted successfully!")
      router.push("/my-events?application=submitted")
    } catch (error) {
      toast.error("Failed to submit application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Become an Organizer</CardTitle>
          <CardDescription>
            Apply to become an event organizer and start hosting your own events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your organization name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="company" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Company
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="individual" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Individual
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="non_profit" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Non-Profit Organization
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-website.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your organization..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of your organization and its mission
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Organization Experience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your experience in organizing events..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventTypes"
                render={() => (
                  <FormItem>
                    <FormLabel>Event Types</FormLabel>
                    <FormDescription>
                      Select the types of events you plan to organize
                    </FormDescription>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {EVENT_TYPES.map((type) => (
                        <FormField
                          key={type.id}
                          control={form.control}
                          name="eventTypes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={type.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(type.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, type.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== type.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {type.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-4">
                <FormLabel>Social Media Links (Optional)</FormLabel>
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="socialLinks.facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Facebook URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialLinks.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Instagram URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialLinks.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Twitter URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socialLinks.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="LinkedIn URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your complete address..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}