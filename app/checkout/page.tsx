"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/hooks/use-auth"
import { StripeProvider } from "@/components/stripe-provider"
import { StripePaymentForm } from "@/components/stripe-payment-form"
import { createPaymentIntent } from "@/app/actions/payment"
import { Loader2, CreditCard, Truck, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const { user } = useAuth()
  const { cart, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentStep, setPaymentStep] = useState<"shipping" | "payment">("shipping")
  const [formData, setFormData] = useState({
    fullName: user ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    pincode: user?.pincode || "",
    phone: user?.phone || "",
  })

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = 0 // Free shipping
  const tax = subtotal * 0.18
  const total = subtotal + shipping + tax

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/cart")
    }
  }, [cart, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate shipping information
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required shipping fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create payment intent
      const result = await createPaymentIntent(total, {
        customerName: formData.fullName,
        customerEmail: formData.email,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.pincode}`,
        orderItems: JSON.stringify(
          cart.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        ),
      })

      if (result.success && result.clientSecret) {
        setClientSecret(result.clientSecret)
        setPaymentStep("payment")
      } else {
        throw new Error(result.error || "Failed to initialize payment")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = (paymentIntent: any) => {
    // Clear cart and redirect to success page
    clearCart()
    router.push(`/payment/success?payment_intent=${paymentIntent.id}`)
  }

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    })
  }

  if (cart.length === 0) {
    return null // Will redirect in useEffect
  }

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center space-x-2 ${paymentStep === "shipping" ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentStep === "shipping" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <Truck className="w-4 h-4" />
              </div>
              <span className="font-medium">Shipping</span>
            </div>
            <div className="w-8 h-px bg-border"></div>
            <div
              className={`flex items-center space-x-2 ${paymentStep === "payment" ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentStep === "payment" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {paymentStep === "shipping" ? (
              <form onSubmit={handleShippingSubmit}>
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                    <CardDescription>Enter your shipping details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input id="state" name="state" value={formData.state} onChange={handleChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode">PIN Code *</Label>
                        <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} required />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Continue to Payment"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            ) : (
              <StripeProvider clientSecret={clientSecret!}>
                <StripePaymentForm
                  clientSecret={clientSecret!}
                  amount={total * 100} // Convert to cents
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </StripeProvider>
            )}

            {paymentStep === "payment" && (
              <div className="mt-4">
                <Button variant="outline" onClick={() => setPaymentStep("shipping")} className="w-full">
                  Back to Shipping
                </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {cart.length} {cart.length === 1 ? "item" : "items"} in cart
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (18%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="border-t pt-2 font-bold flex justify-between">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure payment with Stripe</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4" />
                    <span>Free shipping on all orders</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
