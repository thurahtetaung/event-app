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

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  startTime: z.object({
    hour: z.string().min(1, "Hour is required"),
    minute: z.string().min(1, "Minute is required"),
  }),
  endTime: z.object({
    hour: z.string().min(1, "Hour is required"),
    minute: z.string().min(1, "Minute is required"),
  }),
  location: z.string().min(1, "Location is required"),
  capacity: z.string().min(1, "Capacity is required"),
  isPublic: z.boolean().default(true),
  requiresApproval: z.boolean().default(false),
  allowWaitlist: z.boolean().default(true),
})

interface EventSettingsProps {
  event: {
    id: string
    title: string
    description: string
    date: Date
    startTime?: {
      hour: string
      minute: string
    }
    endTime?: {
      hour: string
      minute: string
    }
    location: string
    capacity: number
  }
}

export function EventSettings({ event }: EventSettingsProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime || {
        hour: "12",
        minute: "00",
      },
      endTime: event.endTime || {
        hour: "13",
        minute: "00",
      },
      location: event.location,
      capacity: String(event.capacity),
      isPublic: true,
      requiresApproval: false,
      allowWaitlist: true,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Add API call to update event settings
    console.log(values)
  }

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
                  <div className="flex gap-2">
                    <Select
                      value={form.watch("startTime.hour")}
                      onValueChange={(hour) => {
                        form.setValue("startTime.hour", hour, { shouldValidate: true });
                      }}
                    >
                      <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent className="h-[200px]">
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0")
                          return (
                            <SelectItem key={hour} value={hour}>
                              {hour}:00
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <span className="flex items-center">:</span>
                    <Select
                      value={form.watch("startTime.minute")}
                      onValueChange={(minute) => {
                        form.setValue("startTime.minute", minute, { shouldValidate: true });
                      }}
                    >
                      <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Minute" />
                      </SelectTrigger>
                      <SelectContent>
                        {["00", "15", "30", "45"].map((minute) => (
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
                  <div className="flex gap-2">
                    <Select
                      value={form.watch("endTime.hour")}
                      onValueChange={(hour) => {
                        form.setValue("endTime.hour", hour, { shouldValidate: true });
                      }}
                    >
                      <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent className="h-[200px]">
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0")
                          return (
                            <SelectItem key={hour} value={hour}>
                              {hour}:00
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <span className="flex items-center">:</span>
                    <Select
                      value={form.watch("endTime.minute")}
                      onValueChange={(minute) => {
                        form.setValue("endTime.minute", minute, { shouldValidate: true });
                      }}
                    >
                      <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Minute" />
                      </SelectTrigger>
                      <SelectContent>
                        {["00", "15", "30", "45"].map((minute) => (
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
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Settings</CardTitle>
            <CardDescription>
              Configure additional event settings
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Public Event</FormLabel>
                    <FormDescription>
                      Make this event visible to everyone
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
            <FormField
              control={form.control}
              name="requiresApproval"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Require Approval</FormLabel>
                    <FormDescription>
                      Manually approve registrations
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
            <FormField
              control={form.control}
              name="allowWaitlist"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Waitlist</FormLabel>
                    <FormDescription>
                      Allow users to join a waitlist when event is full
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
          </CardContent>
        </Card>

        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  )
}