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
import { useState } from "react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import type { EventData } from "@/lib/api-client"

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
  category: z.string(),
  isOnline: z.boolean(),
  capacity: z.number().min(1),
  coverImage: z.string().optional(),
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
    category: string
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
      category: event.category,
      isOnline: event.isOnline,
      capacity: event.capacity,
      coverImage: event.coverImage,
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

      const eventData: Partial<EventData> = {
        title: data.title,
        description: data.description,
        startTimestamp,
        endTimestamp,
        venue: data.venue,
        address: data.address,
        category: data.category,
        isOnline: data.isOnline,
        capacity: data.capacity,
        status: data.status,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="container max-w-5xl mx-auto space-y-8 py-8">
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
                    <Textarea {...field} />
                  </FormControl>
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