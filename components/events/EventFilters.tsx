"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

const EVENT_CATEGORIES = [
  "All Categories",
  "Conference",
  "Workshop",
  "Concert",
  "Exhibition",
  "Sports",
  "Networking",
  "Other",
]

const formSchema = z.object({
  category: z.string().optional(),
  date: z.date().optional(),
  priceRange: z.enum(["all", "free", "paid"]).default("all"),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sort: z.string().default("date"),
  isOnline: z.boolean().default(false),
  isInPerson: z.boolean().default(false),
})

type FilterValues = z.infer<typeof formSchema>

export function EventFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const form = useForm<FilterValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: searchParams.get("category") || undefined,
      date: searchParams.get("date") ? new Date(searchParams.get("date")!) : undefined,
      priceRange: (searchParams.get("priceRange") as "all" | "free" | "paid") || "all",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      sort: searchParams.get("sort") || "date",
      isOnline: searchParams.get("isOnline") === "true",
      isInPerson: searchParams.get("isInPerson") === "true",
    },
  })

  function onSubmit(values: FilterValues) {
    const params = new URLSearchParams()

    // Update search params based on form values
    if (values.category && values.category !== "All Categories") {
      params.set("category", values.category)
    }

    if (values.date) {
      params.set("date", format(values.date, "yyyy-MM-dd"))
    }

    if (values.priceRange !== "all") {
      params.set("priceRange", values.priceRange)
    }

    if (values.minPrice) {
      params.set("minPrice", values.minPrice)
    }

    if (values.maxPrice) {
      params.set("maxPrice", values.maxPrice)
    }

    if (values.sort !== "date") {
      params.set("sort", values.sort)
    }

    if (values.isOnline) {
      params.set("isOnline", "true")
    }

    if (values.isInPerson) {
      params.set("isInPerson", "true")
    }

    // Preserve the search query if it exists
    const query = searchParams.get("query")
    if (query) {
      params.set("query", query)
    }

    // Use router.push to update URL
    router.push(`/events?${params.toString()}`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    <div className="space-y-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
                    {EVENT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
          </SelectContent>
        </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label>Price Range</Label>
            <FormField
              control={form.control}
              name="priceRange"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-3 gap-4"
                >
                  <FormItem>
                    <FormControl>
                      <div>
                        <RadioGroupItem
                          value="all"
                          id="all"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="all"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span>All</span>
                        </Label>
                      </div>
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <div>
                        <RadioGroupItem
                          value="free"
                          id="free"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="free"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span>Free</span>
                        </Label>
                      </div>
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormControl>
                      <div>
                        <RadioGroupItem
                          value="paid"
                          id="paid"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="paid"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <span>Paid</span>
                        </Label>
                      </div>
                    </FormControl>
                  </FormItem>
                </RadioGroup>
              )}
            />
      </div>

      <div className="space-y-2">
            <Label>Custom Price Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Min"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
        <Input
          type="number"
                        placeholder="Max"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                  </FormItem>
                )}
        />
      </div>
          </div>

          <div className="space-y-2">
            <Label>Event Type</Label>
      <div className="space-y-2">
              <FormField
                control={form.control}
                name="isOnline"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label>Online Events</Label>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isInPerson"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label>In-Person Events</Label>
                  </FormItem>
                )}
        />
      </div>
          </div>

          <Separator />

          <FormField
            control={form.control}
            name="sort"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort By</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date (Newest)</SelectItem>
                    <SelectItem value="price-low">Price (Low to High)</SelectItem>
                    <SelectItem value="price-high">Price (High to Low)</SelectItem>
          </SelectContent>
        </Select>
              </FormItem>
            )}
          />
      </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset()
              router.push("/events")
            }}
            className="flex-1"
          >
            Reset
          </Button>
          <Button type="submit" className="flex-1">
        Apply Filters
      </Button>
    </div>
      </form>
    </Form>
  )
}

