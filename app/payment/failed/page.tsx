"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PaymentFailedPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              We couldn't process your payment. This could be due to insufficient funds, an expired card, or other
              payment issues.
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Common reasons for payment failure:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Insufficient funds in your account</li>
              <li>• Expired or invalid card details</li>
              <li>• Card blocked by your bank</li>
              <li>• Incorrect billing information</li>
              <li>• Network connectivity issues</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href="/checkout">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/cart">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact our support team
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
