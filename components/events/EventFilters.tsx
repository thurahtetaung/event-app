"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import * as z from "zod"
import { CalendarIcon } from "lucide-react" // Removed Clock
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
import { apiClient } from "@/lib/api-client"
import { DateRange } from "react-day-picker"

// Default categories in case API fails
const DEFAULT_CATEGORIES = [
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
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(), // Changed from date to dateRange
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
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");
    if (start && end) {
      return { from: new Date(start), to: new Date(end) };
    } else if (start) {
      return { from: new Date(start), to: undefined };
    } else if (end) {
      return { from: undefined, to: new Date(end) };
    }
    return undefined;
  });

  const form = useForm<FilterValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: searchParams.get("category") || undefined,
      dateRange: dateRange, // Use the state variable
      priceRange: (searchParams.get("priceRange") as "all" | "free" | "paid") || "all",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      sort: searchParams.get("sort") || "date",
      isOnline: searchParams.get("isOnline") === "true",
      isInPerson: searchParams.get("isInPerson") === "true",
    },
  })

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiClient.categories.getAll()
        // Add "All Categories" as the first option
        setCategories(["All Categories", ...data.map(cat => cat.name)])
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        // Keep using default categories on error
      }
    }

    fetchCategories()
  }, [])

  function onSubmit(values: FilterValues) {
    const params = new URLSearchParams()

    // Update search params based on form values
    if (values.category && values.category !== "All Categories") {
      params.set("category", values.category)
    }

    // Use dateRange from state, not form values directly, as Calendar updates state
    if (dateRange?.from) {
      params.set("startDate", format(dateRange.from, "yyyy-MM-dd"))
    }
    if (dateRange?.to) {
      params.set("endDate", format(dateRange.to, "yyyy-MM-dd"))
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
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
          </SelectContent>
        </Select>
              </FormItem>
            )}
          />

          {/* Date Range Picker */}
          <FormItem>
            <FormLabel>Date Range</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange} // Update state directly
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </FormItem>

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
              form.reset();
              setDateRange(undefined); // Reset date range state
              router.push("/events");
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

