import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CheckoutFailure() {
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
      <p className="mb-8">We're sorry, but there was an issue processing your payment. Please try again.</p>
      <Button asChild>
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  )
}

