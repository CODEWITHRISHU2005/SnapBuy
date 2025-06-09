"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, Truck, Mail } from "lucide-react"
import { confirmPayment } from "@/app/actions/payment"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentStatus, setPaymentStatus] = useState<"loading" | "success" | "error">("loading")
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  const paymentIntentId = searchParams.get("payment_intent")

  useEffect(() => {
    if (!paymentIntentId) {
      router.push("/cart")
      return
    }

    const verifyPayment = async () => {
      try {
        const result = await confirmPayment(paymentIntentId)

        if (result.success && result.status === "succeeded") {
          setPaymentStatus("success")
          setPaymentDetails(result.paymentIntent)
        } else {
          setPaymentStatus("error")
        }
      } catch (error) {
        setPaymentStatus("error")
      }
    }

    verifyPayment()
  }, [paymentIntentId, router])

  if (paymentStatus === "loading") {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentStatus === "error") {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Payment Verification Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We couldn't verify your payment. Please contact support if you believe this is an error.
            </p>
            <div className="flex space-x-4">
              <Button asChild>
                <Link href="/cart">Return to Cart</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              Thank you for your purchase! Your order has been confirmed and is being processed.
            </p>
          </div>

          {paymentDetails && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Payment ID:</span>
                <span className="font-mono text-sm">{paymentDetails.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Amount:</span>
                <span>${(paymentDetails.amount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className="capitalize text-green-600">{paymentDetails.status}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold">What happens next?</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-sm">You'll receive an order confirmation email shortly</span>
              </div>
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-orange-600" />
                <span className="text-sm">Your order will be processed within 1-2 business days</span>
              </div>
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-green-600" />
                <span className="text-sm">You'll receive tracking information once shipped</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href="/dashboard">View Order History</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
