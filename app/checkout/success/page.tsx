import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CheckoutSuccess() {
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
      <p className="mb-8">Thank you for your purchase. Your tickets have been confirmed.</p>
      <Button asChild>
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  )
}

