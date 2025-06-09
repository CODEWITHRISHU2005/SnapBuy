import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import type Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log("Payment succeeded:", paymentIntent.id)

        // Here you would typically:
        // 1. Update order status in your database
        // 2. Send confirmation email
        // 3. Update inventory
        // 4. Create shipping label

        await handlePaymentSuccess(paymentIntent)
        break

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent
        console.log("Payment failed:", failedPayment.id)

        await handlePaymentFailure(failedPayment)
        break

      case "customer.created":
        const customer = event.data.object as Stripe.Customer
        console.log("Customer created:", customer.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  // Implement your post-payment logic here
  // Example: Update order status, send emails, etc.
  console.log("Processing successful payment:", paymentIntent.id)

  // You would typically update your database here
  // const orderId = paymentIntent.metadata.orderId
  // await updateOrderStatus(orderId, 'paid')
  // await sendConfirmationEmail(paymentIntent.receipt_email)
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  // Handle failed payment
  console.log("Processing failed payment:", paymentIntent.id)

  // You might want to:
  // - Send notification to customer
  // - Update order status
  // - Log for analytics
}
