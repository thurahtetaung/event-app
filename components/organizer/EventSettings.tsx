"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { DatePicker } from "@/components/ui/date-picker"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import type { EventData } from "@/lib/api-client"
import { Upload, Trash2 } from "lucide-react"
import Image from "next/image"
import { uploadEventCoverImage } from "@/lib/supabase-client"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.date(),
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
  capacity: z.number().min(1),
  coverImage: z.instanceof(File).optional(),
  status: z.enum(["draft", "published", "cancelled"]).optional(),
}).refine((data) => {
  // If it's not an online event, venue and address are required
  if (!data.isOnline) {
    if (!data.venue) return false;
    if (!data.address) return false;
  }
  return true;
}, {
  message: "Venue and address are required for in-person events",
  path: ["venue"],
});

interface EventSettingsProps {
  event: {
    id: string
    title: string
    description: string
    startTimestamp: string
    endTimestamp: string
    venue: string | null
    address: string | null
    categoryId: string
    categoryObject?: {
      id: string
      name: string
      icon: string
    }
    isOnline: boolean
    capacity: number
    coverImage?: string
    status: "draft" | "published" | "cancelled"
  }
  onSuccess?: (event: Partial<EventData>) => void
}

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
const minutes = ["00", "15", "30", "45"]

export function EventSettings({ event, onSuccess }: EventSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [coverImagePreview, setCoverImagePreview] = useState<string>(event.coverImage || "")
  const [categories, setCategories] = useState<Array<{id: string, name: string, icon: string}>>([])

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiClient.categories.getAll()
        setCategories(data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        toast.error("Failed to load categories")
      }
    }
    fetchCategories()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      date: new Date(event.startTimestamp),
      startTime: {
        hour: format(new Date(event.startTimestamp), "HH"),
        minute: format(new Date(event.startTimestamp), "mm"),
      },
      endTime: {
        hour: format(new Date(event.endTimestamp), "HH"),
        minute: format(new Date(event.endTimestamp), "mm"),
      },
      venue: event.venue,
      address: event.address,
      categoryId: event.categoryId,
      isOnline: event.isOnline,
      capacity: event.capacity,
      status: event.status,
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const startTimestamp = new Date(
        `${data.date.toISOString().split('T')[0]}T${data.startTime.hour}:${data.startTime.minute}:00`
      ).toISOString();
      const endTimestamp = new Date(
        `${data.date.toISOString().split('T')[0]}T${data.endTime.hour}:${data.endTime.minute}:00`
      ).toISOString();

      let coverImageUrl = event.coverImage;
      if (data.coverImage) {
        coverImageUrl = await uploadEventCoverImage(data.coverImage);
      }

      const eventData: Partial<EventData> = {
        title: data.title,
        description: data.description,
        startTimestamp,
        endTimestamp,
        venue: data.venue,
        address: data.address,
        categoryId: data.categoryId,
        isOnline: data.isOnline,
        capacity: data.capacity,
        status: data.status,
        coverImage: coverImageUrl,
      };

      await apiClient.events.update(event.id, eventData);
      toast.success('Event updated successfully');
      router.refresh();
      onSuccess?.(eventData);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue('coverImage', file)
      setCoverImagePreview(URL.createObjectURL(file))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="container max-w-5xl mx-auto space-y-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Cover Image</CardTitle>
            <CardDescription>
              Update your event's cover image
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update your event's basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                      value={field.value || ''}
                      onChange={field.onChange}
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

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label>Date</Label>
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={form.watch("startTime.hour")}
                      onValueChange={(value) => form.setValue("startTime.hour", value, { shouldValidate: true })}
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder="HH" />
                      </SelectTrigger>
                      <SelectContent className="h-[200px]">
                        {hours.map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="flex items-center">:</span>
                    <Select
                      value={form.watch("startTime.minute")}
                      onValueChange={(value) => form.setValue("startTime.minute", value, { shouldValidate: true })}
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {minutes.map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={form.watch("endTime.hour")}
                      onValueChange={(value) => form.setValue("endTime.hour", value, { shouldValidate: true })}
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder="HH" />
                      </SelectTrigger>
                      <SelectContent className="h-[200px]">
                        {hours.map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="flex items-center">:</span>
                    <Select
                      value={form.watch("endTime.minute")}
                      onValueChange={(value) => form.setValue("endTime.minute", value, { shouldValidate: true })}
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {minutes.map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="isOnline"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Online Event</FormLabel>
                    <FormDescription>
                      This event will be hosted online
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
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} placeholder="Enter venue name" />
                      </FormControl>
                      <FormDescription>
                        The name of the venue where the event will be held
                      </FormDescription>
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
                        <Input {...field} value={field.value || ''} placeholder="Enter venue address" />
                      </FormControl>
                      <FormDescription>
                        The full address of the venue
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>
              Advanced features like event visibility, registration approval, and waitlist management are coming soon in a future update.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <TooltipProvider>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Public Event</Label>
                  <p className="text-muted-foreground">Make this event visible to everyone</p>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <Switch
                      checked={false}
                      onCheckedChange={() => {}}
                      disabled
                      className="data-[state=checked]:bg-muted-foreground"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming soon</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Require Approval</Label>
                  <p className="text-muted-foreground">Manually approve attendee registrations</p>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <Switch
                      checked={false}
                      onCheckedChange={() => {}}
                      disabled
                      className="data-[state=checked]:bg-muted-foreground"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming soon</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Waitlist</Label>
                  <p className="text-muted-foreground">Allow attendees to join a waitlist when tickets are sold out</p>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <Switch
                      checked={false}
                      onCheckedChange={() => {}}
                      disabled
                      className="data-[state=checked]:bg-muted-foreground"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming soon</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  )
}