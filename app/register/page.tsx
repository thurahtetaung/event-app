"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { OtpVerification } from "@/components/auth/OtpVerification"
import { useAuth } from "@/contexts/AuthContext"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email address"),
  dateOfBirth: z.date({
    required_error: "Please select your date of birth",
  }),
  country: z.string().min(2, "Please select your country"),
})

type RegisterForm = z.infer<typeof registerSchema>

interface Country {
  code: string
  name: string
}

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [defaultCountry, setDefaultCountry] = useState<string>("")
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      dateOfBirth: undefined,
      country: "",
    },
  })

  // Fetch countries on component mount
  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await fetch("/api/countries")
        const data = await response.json()
        setCountries(data.countries)
        setDefaultCountry(data.defaultCountry)
        form.setValue("country", data.defaultCountry)
      } catch (error) {
        console.error("Failed to fetch countries:", error)
        toast.error("Failed to load country list")
      }
    }
    fetchCountries()
  }, [form])

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth.toISOString(),
          country: data.country,
          role: "user",
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Registration failed")
      }

      setRegisteredEmail(data.email)
      setShowOtpInput(true)
      toast.success("Registration successful! Please verify your email.")
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/users/verifyRegistration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP")
      }

      await login(data.access_token)
      toast.success("Email verified successfully")
      router.push("/")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid OTP")
      console.error(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/resendRegistrationOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend OTP")
      throw error
    }
  }

  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 13) // Minimum age of 13
  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - 100) // Maximum age of 100

  if (showOtpInput) {
    return (
      <div className="container max-w-lg py-10">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Verify your email</CardTitle>
            <CardDescription>
              Please verify your email address to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OtpVerification
              email={registeredEmail}
              onVerify={handleVerifyOtp}
              onResendOtp={handleResendOtp}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-lg py-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.smith@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        fromYear={minDate.getFullYear()}
                        toYear={maxDate.getFullYear()}
                        disabled={(date) => date > maxDate || date < minDate}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}