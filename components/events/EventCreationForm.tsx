"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import { Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { apiClient, type RawFormEventData } from "@/lib/api-client"
import { DatePicker } from "@/components/ui/date-picker"
import { uploadEventCoverImage } from "@/lib/supabase-client"

interface FormEventData extends RawFormEventData {}

// Default categories in case API fails
const DEFAULT_CATEGORIES = [
  "Conference",
  "Workshop",
  "Concert",
  "Exhibition",
  "Sports",
  "Networking",
  "Other",
]

// Define a Category interface
interface Category {
  id: string;
  name: string;
  icon: string;
}

// These fields are just for UI preview and not part of the form submission
interface PreviewFields {
  isPrivate: boolean
  requireApproval: boolean
  enableWaitlist: boolean
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.date({
    required_error: "Date is required",
  }),
  startTime: z.object({
    hour: z.string(),
    minute: z.string(),
  }),
  endTime: z.object({
    hour: z.string(),
    minute: z.string(),
  }),
  venue: z.string().nullable(),
  address: z.string().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  isOnline: z.boolean(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  coverImage: z.instanceof(File).optional(),
}).refine((data) => {
  // Convert hours and minutes to numbers
  const startHour = parseInt(data.startTime.hour);
  const startMinute = parseInt(data.startTime.minute);
  const endHour = parseInt(data.endTime.hour);
  const endMinute = parseInt(data.endTime.minute);

  // Check if end time is after start time
  return (endHour > startHour) || (endHour === startHour && endMinute > startMinute);
}, {
  message: "End time must be after start time",
  path: ["endTime"], // Show error on the end time field
});

type FormValues = z.infer<typeof formSchema>

export function EventCreationForm() {
  const router = useRouter()
  const [coverImagePreview, setCoverImagePreview] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
    title: "",
    description: "",
      date: new Date(),
    startTime: {
      hour: "12",
        minute: "00",
    },
    endTime: {
      hour: "13",
        minute: "00",
    },
    venue: "",
    address: "",
    categoryId: "",
    isOnline: false,
      capacity: 100,
    },
  })

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiClient.categories.getAll()
        setCategories(data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        // Create default categories with fake IDs for fallback
        setCategories(DEFAULT_CATEGORIES.map(name => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          icon: 'Globe'
        })))
      }
    }

    fetchCategories()
  }, [])

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue('coverImage', file)
      setCoverImagePreview(URL.createObjectURL(file))
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true)

      // Ensure we have a valid date
      if (!values.date || !(values.date instanceof Date)) {
        throw new Error("Invalid date");
      }

      // Create a new Date object to ensure we have a proper instance
      const eventDate = new Date(values.date.getTime());

      const eventData: RawFormEventData = {
        title: values.title,
        description: values.description,
        date: eventDate,
        startTime: {
          hour: values.startTime.hour,
          minute: values.startTime.minute,
        },
        endTime: {
          hour: values.endTime.hour,
          minute: values.endTime.minute,
        },
        venue: values.isOnline ? null : values.venue,
        address: values.isOnline ? null : values.address,
        categoryId: values.categoryId,
        isOnline: values.isOnline,
        capacity: Number(values.capacity),
        coverImage: values.coverImage,
      }

      const event = await apiClient.events.create(eventData)
      toast.success("Event created successfully")
      router.push(`/organizer/events/${event.id}`)
    } catch (error: any) {
      console.error("Error creating event:", error)

      // Extract error message from the API response
      let errorMessage: string;
      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error.message === 'string') {
        errorMessage = error.message;
      } else {
        errorMessage = 'Failed to create event';
      }

      // Show error in toast
      toast.error(errorMessage);

      // Set form field errors based on the error message
      if (errorMessage.toLowerCase().includes('capacity')) {
        form.setError('capacity', {
          type: 'manual',
          message: errorMessage
        });
      } else if (errorMessage.toLowerCase().includes('venue') || errorMessage.toLowerCase().includes('address')) {
        if (errorMessage.toLowerCase().includes('venue')) {
          form.setError('venue', {
            type: 'manual',
            message: errorMessage
          });
        }
        if (errorMessage.toLowerCase().includes('address')) {
          form.setError('address', {
            type: 'manual',
            message: errorMessage
          });
        }
      } else if (errorMessage.toLowerCase().includes('time') || errorMessage.toLowerCase().includes('date')) {
        if (errorMessage.toLowerCase().includes('end time')) {
          form.setError('endTime', {
            type: 'manual',
            message: 'End time must be after start time'
          });
        } else if (errorMessage.toLowerCase().includes('start')) {
          form.setError('startTime', {
            type: 'manual',
            message: errorMessage
          });
        } else if (errorMessage.toLowerCase().includes('end')) {
          form.setError('endTime', {
            type: 'manual',
            message: errorMessage
          });
        } else {
          form.setError('date', {
            type: 'manual',
            message: errorMessage
          });
        }
      } else if (errorMessage.toLowerCase().includes('category')) {
        form.setError('categoryId', {
          type: 'manual',
          message: 'Please select a valid category'
        });
      } else if (errorMessage.toLowerCase().includes('organization')) {
        // This is a special case error - redirect to organization creation
        toast.error('You need to create an organization before creating events');
        router.push('/organizer/organization');
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-8">
          {/* Cover Image */}
          <div className="space-y-4">
            <Label>Cover Image</Label>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed">
              {coverImagePreview ? (
                <div className="group relative h-full">
                  <Image
                    src={coverImagePreview}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        form.setValue('coverImage', undefined)
                        setCoverImagePreview("")
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Image
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </span>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
              <Input
                        placeholder="Enter event title"
                        {...field}
                      />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your event"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
              <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                      </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Date and Time */}
          <Card>
            <CardHeader>
              <CardTitle>Date and Time</CardTitle>
              <CardDescription>
                Set when your event will take place
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Date</FormLabel>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                    <Select
                          onValueChange={(value) =>
                            field.onChange({ ...field.value, hour: value })
                          }
                          value={field.value.hour}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            {Array.from({ length: 24 }, (_, i) => i).map(
                              (hour) => (
                                <SelectItem
                                  key={hour}
                                  value={hour.toString().padStart(2, "0")}
                                >
                                  {hour.toString().padStart(2, "0")}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                    <Select
                          onValueChange={(value) =>
                            field.onChange({ ...field.value, minute: value })
                          }
                          value={field.value.minute}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Minute" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            {["00", "15", "30", "45"].map((minute) => (
                              <SelectItem key={minute} value={minute}>
                                {minute}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                  </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                    <Select
                          onValueChange={(value) =>
                            field.onChange({ ...field.value, hour: value })
                          }
                          value={field.value.hour}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            {Array.from({ length: 24 }, (_, i) => i).map(
                              (hour) => (
                                <SelectItem
                                  key={hour}
                                  value={hour.toString().padStart(2, "0")}
                                >
                                  {hour.toString().padStart(2, "0")}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                    <Select
                          onValueChange={(value) =>
                            field.onChange({ ...field.value, minute: value })
                          }
                          value={field.value.minute}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Minute" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            {["00", "15", "30", "45"].map((minute) => (
                              <SelectItem key={minute} value={minute}>
                                {minute}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                  </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>
                Set where your event will take place
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="isOnline"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                      <FormLabel>Online Event</FormLabel>
                      <FormDescription>
                        This event will take place online
                      </FormDescription>
                    </div>
                    <FormControl>
                  <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!form.watch("isOnline") && (
                <>
                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter venue name"
                            {...field}
                            value={field.value || ""}
                          />
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
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                      <Textarea
                            placeholder="Enter venue address"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Capacity */}
          <Card>
            <CardHeader>
              <CardTitle>Capacity</CardTitle>
              <CardDescription>
                Set the maximum number of attendees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Enter maximum capacity"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Preview Features */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings (Coming Soon)</CardTitle>
              <CardDescription>
                These features will be available in a future update
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Private Event</Label>
                  <FormDescription>
                    Only invited attendees can view and register
                  </FormDescription>
                </div>
                <Switch disabled checked={false} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Require Approval</Label>
                  <FormDescription>
                    Review and approve attendee registrations
                  </FormDescription>
                </div>
                <Switch disabled checked={false} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Waitlist</Label>
                  <FormDescription>
                    Allow attendees to join a waitlist when tickets are sold out
                  </FormDescription>
                    </div>
                <Switch disabled checked={false} />
                  </div>
                </CardContent>
              </Card>
          </div>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </form>
    </Form>
  )
}