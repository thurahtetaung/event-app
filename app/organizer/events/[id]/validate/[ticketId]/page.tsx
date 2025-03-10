"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { formatDistance, format } from "date-fns"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Ticket,
  Calendar,
  ArrowLeft,
  Building,
  BadgeCheck,
  XCircle,
  Key,
  ShieldAlert,
  Mail,
  Info,
  MapPin,
  Phone,
  Hash,
  CreditCard,
  Tag
} from "lucide-react"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface TicketDetails {
  success: boolean;
  ticket: {
    id: string;
    status: string;
    isValidated: boolean;
    validatedAt?: string;
    bookedAt?: string;
    price?: number;
    ticketType: {
      id: string;
      name: string;
      type: string;
    };
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
    };
    event: {
      id: string;
      title: string;
      startTimestamp?: string;
      endTimestamp?: string;
      venue?: string;
      address?: string;
    };
  };
}

const accessTokenSchema = z.object({
  accessToken: z.string()
    .min(1, "Access token is required")
    .refine(token => token.trim().length > 0, "Access token cannot be empty"),
})

type AccessTokenFormValues = z.infer<typeof accessTokenSchema>

export default function TicketValidationPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const accessToken = searchParams.get("accessToken")
  const id = params.id as string
  const ticketId = params.ticketId as string

  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validationSuccess, setValidationSuccess] = useState(false)
  const [validationMessage, setValidationMessage] = useState("")
  const [manualAccessToken, setManualAccessToken] = useState<string>("")

  const accessTokenForm = useForm<AccessTokenFormValues>({
    resolver: zodResolver(accessTokenSchema),
    defaultValues: {
      accessToken: "",
    },
  })

  function onAccessTokenSubmit(data: AccessTokenFormValues) {
    setManualAccessToken(data.accessToken)
    verifyTicket(data.accessToken)
  }

  // Error message extraction that directly handles the backend's error format
  const formatErrorMessage = (error: unknown): string => {
    // Backend API error format
    if (error && typeof error === 'object') {
      // Direct API error response: {"success":false,"error":{"code":"NOT_FOUND","message":"Ticket not found"}}
      if ('success' in error && error.success === false && 'error' in error) {
        const apiError = error as { success: false; error: { code: string; message: string } };
        return apiError.error.message;
      }

      // Normal Error object
      if (error instanceof Error) {
        return error.message;
      }
    }

    // String error
    if (typeof error === 'string') {
      return error;
    }

    // Last resort
    return "Unknown error occurred";
  }

  const verifyTicket = async (tokenToUse?: string) => {
    const tokenValue = tokenToUse || accessToken

    if (!tokenValue) {
      setIsLoading(false)
      setError("Access token is required to verify this ticket")
      return
    }

    try {
      if (!manualAccessToken) {
        setIsLoading(true)
      }
      setError(null)

      const data = await apiClient.tickets.verifyTicket(id, ticketId, tokenValue)
      setTicketDetails(data)
    } catch (err) {
      console.error("Error verifying ticket:", err)

      const errorMsg = formatErrorMessage(err);
      console.log("Error message:", errorMsg);

      if (errorMsg.includes("not found")) {
        setError(`Ticket #${ticketId} not found. Please check the ticket ID.`)
      } else if (errorMsg.includes("token") || errorMsg.includes("Token")) {
        setError("Invalid access token. Please check and try again.")
      } else if (errorMsg.includes("invalid")) {
        setError("Invalid ticket ID format. Please check the ticket ID.")
      } else {
        setError(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await apiClient.tickets.getTicketDetails(id, ticketId)
        setTicketDetails(data)
      } catch (err) {
        console.error("Error fetching ticket details:", err)

        const errorMsg = formatErrorMessage(err);
        console.log("Error message:", errorMsg);

        if (errorMsg.includes("not found")) {
          setError(`Ticket #${ticketId} not found. Please check the ticket ID.`)
        } else if (errorMsg.includes("invalid")) {
          setError(`Invalid ticket ID format. Please check the ticket ID.`)
        } else {
          setError(errorMsg)
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (id && ticketId) {
      fetchTicketDetails()
    } else {
      setIsLoading(false)
      if (!id) setError("Event ID is missing")
      if (!ticketId) setError("Ticket ID is missing")
    }

    if (id && ticketId && accessToken) {
      verifyTicket()
    }
  }, [id, ticketId, accessToken])

  const handleValidateTicket = async () => {
    if (!ticketDetails) {
      setError("Invalid ticket")
      return
    }

    const tokenToUse = accessToken || manualAccessToken

    if (!tokenToUse) {
      setError("Access token is required for validation")
      return
    }

    try {
      setIsValidating(true)
      setError(null)

      setValidationMessage("Processing ticket validation...")

      const response = await apiClient.tickets.validateTicket(id, ticketId, tokenToUse)

      setValidationSuccess(true)
      setValidationMessage(response.message)

      setTicketDetails({
        ...ticketDetails,
        ticket: {
          ...ticketDetails.ticket,
          isValidated: true,
          validatedAt: response.ticket.validatedAt,
        }
      })
    } catch (err) {
      console.error("Error validating ticket:", err)
      setValidationSuccess(false)
      setValidationMessage("")

      const errorMsg = formatErrorMessage(err);
      console.log("Error message:", errorMsg);

      if (errorMsg.includes("token") || errorMsg.includes("Token")) {
        setError("Invalid access token. The token may have expired or been used already.")
      } else if (errorMsg.includes("already validated")) {
        setError("This ticket has already been validated.")
      } else {
        setError(errorMsg)
      }
    } finally {
      setIsValidating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Loading Ticket</CardTitle>
            <CardDescription>Please wait while we retrieve the ticket information...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground text-sm text-center">
              This should only take a moment. If loading persists, please check your connection and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !ticketDetails) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Error Loading Ticket</CardTitle>
            <CardDescription>We couldn't find or load this ticket</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {error.includes("not found")
                  ? "Ticket Not Found"
                  : error.includes("token")
                    ? "Access Token Error"
                    : error.includes("Invalid ticket ID")
                      ? "Invalid Ticket"
                      : "Error"}
              </AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="rounded-lg bg-muted p-4 mt-4">
              <h4 className="font-medium mb-2">Possible solutions:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {error.includes("not found") && (
                  <>
                    <li>Make sure the ticket ID in the URL is correct</li>
                    <li>Verify that the ticket exists and has been purchased</li>
                  </>
                )}
                {(error.includes("invalid") || error.includes("Invalid ticket ID")) && (
                  <>
                    <li>The ticket ID format is incorrect</li>
                    <li>Try scanning the QR code again or enter the ID manually</li>
                    <li>Verify the ticket was purchased and is active</li>
                  </>
                )}
                <li>Return to the validation page and try a different ticket</li>
                <li>Contact the system administrator if the problem persists</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/organizer/events/${id}/validate`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Validation
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!ticketDetails) {
    return null
  }

  const { ticket } = ticketDetails
  const isAlreadyValidated = ticket.isValidated

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-6">
        <Button variant="ghost" className="mb-4 pl-0" asChild>
          <Link href={`/organizer/events/${id}/validate`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ticket Validation
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Ticket Information</CardTitle>
                  <CardDescription className="text-base">
                    {ticket.event.title}
                  </CardDescription>
                </div>
                {ticket.isValidated ? (
                  <Badge className="bg-green-500 text-white py-1 px-3 text-sm">Validated</Badge>
                ) : (
                  <Badge className="bg-blue-500 text-white py-1 px-3 text-sm">Not Validated</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-8 pt-6">
              {validationSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">Success</AlertTitle>
                  <AlertDescription className="text-green-600">
                    {validationMessage}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-primary">
                    <User className="h-5 w-5 mr-2" />
                    Attendee Information
                  </h3>
                  <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium text-lg">
                        {ticket.user.firstName} {ticket.user.lastName}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                        <p className="font-medium">{ticket.user.email}</p>
                      </div>
                    </div>

                    {ticket.user.phoneNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                          <p className="font-medium">{ticket.user.phoneNumber}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-muted-foreground">User ID</p>
                      <div className="flex items-center">
                        <Info className="h-4 w-4 mr-1 text-muted-foreground" />
                        <p className="font-mono text-sm">{ticket.user.id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-primary">
                    <Ticket className="h-5 w-5 mr-2" />
                    Ticket Details
                  </h3>
                  <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Ticket Type</p>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
                        <p className="font-medium">{ticket.ticketType.name}</p>
                      </div>
                      <Badge className="mt-1" variant={ticket.ticketType.type === 'free' ? 'outline' : 'default'}>
                        {ticket.ticketType.type === 'free' ? 'Free Ticket' : 'Paid Ticket'}
                      </Badge>
                    </div>

                    {typeof ticket.price === 'number' && ticket.price > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-1 text-muted-foreground" />
                          <p className="font-medium">${(ticket.price / 100).toFixed(2)}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-muted-foreground">Ticket ID</p>
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 mr-1 text-muted-foreground" />
                        <p className="font-mono text-sm">{ticket.id}</p>
                      </div>
                    </div>

                    {ticket.bookedAt && (
                      <div>
                        <p className="text-sm text-muted-foreground">Purchased</p>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          <p className="font-medium">{format(new Date(ticket.bookedAt), 'PPP')}</p>
                        </div>
                      </div>
                    )}

                    {ticket.isValidated && ticket.validatedAt && (
                      <div>
                        <p className="text-sm text-muted-foreground">Validated</p>
                        <div className="flex items-center">
                          <BadgeCheck className="h-4 w-4 mr-1 text-muted-foreground" />
                          <p className="font-medium">{format(new Date(ticket.validatedAt), 'PPP pp')}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistance(new Date(ticket.validatedAt), new Date(), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center text-primary">
                  <Calendar className="h-5 w-5 mr-2" />
                  Event Information
                </h3>
                <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Event Name</p>
                    <p className="font-medium">{ticket.event.title}</p>
                  </div>

                  {ticket.event.startTimestamp && ticket.event.endTimestamp && (
                    <div>
                      <p className="text-sm text-muted-foreground">Event Date & Time</p>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <p className="font-medium">
                          {format(new Date(ticket.event.startTimestamp), 'PPP')}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground pl-5">
                        {format(new Date(ticket.event.startTimestamp), 'p')} -
                        {format(new Date(ticket.event.endTimestamp), 'p')}
                      </p>
                    </div>
                  )}

                  {(ticket.event.venue || ticket.event.address) && (
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      {ticket.event.venue && (
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                          <p className="font-medium">{ticket.event.venue}</p>
                        </div>
                      )}
                      {ticket.event.address && (
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-1 text-muted-foreground mt-1" />
                          <p className="text-sm">{ticket.event.address}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-2 shadow-lg sticky top-6">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex items-center space-x-2">
                <BadgeCheck className="h-5 w-5 text-primary" />
                <CardTitle>{isAlreadyValidated ? "Ticket Validated" : "Validate This Ticket"}</CardTitle>
              </div>
              <CardDescription className="text-base mt-2">
                {isAlreadyValidated
                  ? "This ticket has already been validated"
                  : "Enter the access token to validate this ticket"}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {isAlreadyValidated ? (
                <div className="rounded-lg bg-green-50 border border-green-100 p-4 text-center">
                  <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-green-700">This ticket has been validated</p>
                  {ticket.validatedAt && (
                    <p className="text-sm text-green-600 mt-1">
                      Validated {formatDistance(new Date(ticket.validatedAt), new Date(), { addSuffix: true })}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {(!accessToken && !manualAccessToken) ? (
                    <Form {...accessTokenForm}>
                      <form onSubmit={accessTokenForm.handleSubmit(onAccessTokenSubmit)} className="space-y-4">
                        <FormField
                          control={accessTokenForm.control}
                          name="accessToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">Access Token</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    placeholder="Enter access token"
                                    {...field}
                                    className={cn(
                                      error ? "border-red-500 pr-10 focus-visible:ring-red-300" : "focus-visible:ring-primary/50",
                                      "text-base py-6 px-4 shadow-sm transition-all"
                                    )}
                                  />
                                  {error && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                                      <ShieldAlert className="h-5 w-5" />
                                    </div>
                                  )}
                                  {field.value && !error && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                      <CheckCircle className="h-5 w-5" />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage className="text-sm font-medium" />
                            </FormItem>
                          )}
                        />

                        <div className="bg-muted/30 p-4 rounded-lg border mt-2">
                          <p className="font-medium text-base mb-2 flex items-center">
                            <Info className="h-4 w-4 mr-2 text-primary" />
                            Where to find the access token:
                          </p>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <span className="bg-primary/10 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                                1
                              </span>
                              <span>On the ticket's QR code</span>
                            </li>
                            <li className="flex items-start">
                              <span className="bg-primary/10 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                                2
                              </span>
                              <span>In the confirmation email</span>
                            </li>
                            <li className="flex items-start">
                              <span className="bg-primary/10 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                                3
                              </span>
                              <span>In the attendee's "My Tickets"</span>
                            </li>
                          </ul>
                        </div>

                        {error && (
                          <Alert variant="destructive" className="mt-2 animate-in fade-in-50">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>
                              {error.includes("token") ? "Invalid Access Token" : "Error"}
                            </AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <Button
                          type="submit"
                          className="w-full py-6 text-base font-medium mt-4 transition-all"
                          disabled={accessTokenForm.formState.isSubmitting}
                        >
                          {accessTokenForm.formState.isSubmitting ? (
                            <>
                              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-background border-r-transparent"></div>
                              Verifying...
                            </>
                          ) : (
                            <>
                              <Key className="mr-2 h-5 w-5" />
                              Verify Access Token
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    <div className="space-y-6">
                      {error ? (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>
                            {error.includes("token")
                              ? "Access Token Error"
                              : error.includes("validated")
                                ? "Already Validated"
                                : "Verification Error"}
                          </AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      ) : (
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <p className="text-center">Access token verified successfully</p>
                        </div>
                      )}

                      <Button
                        onClick={handleValidateTicket}
                        disabled={isValidating || error !== null}
                        className="w-full py-6 text-lg"
                        size="lg"
                      >
                        {isValidating ? (
                          <>
                            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-background border-r-transparent"></div>
                            Validating...
                          </>
                        ) : (
                          <>
                            <BadgeCheck className="mr-2 h-5 w-5" />
                            Validate Ticket
                          </>
                        )}
                      </Button>

                      {!isValidating && !error && (
                        <p className="text-center text-sm text-muted-foreground">
                          Click the button above to validate this ticket and allow entry
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>

            <CardFooter className="bg-muted/10 border-t pt-4">
              <p className="text-sm text-muted-foreground text-center w-full">
                {isAlreadyValidated
                  ? "This ticket has already been used for entry"
                  : "Validate only after confirming attendee identity"}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}