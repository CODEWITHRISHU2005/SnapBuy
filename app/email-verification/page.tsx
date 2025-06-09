"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function EmailVerificationPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { toast } = useToast()
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading")

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setStatus("error")
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      // Replace with actual API call to your backend
      // const response = await fetch('/api/auth/verify-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token: verificationToken })
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate different responses based on token
      if (verificationToken === "expired") {
        setStatus("expired")
      } else if (verificationToken === "invalid") {
        setStatus("error")
      } else {
        setStatus("success")
        toast({
          title: "Email verified!",
          description: "Your email has been successfully verified.",
        })
      }
    } catch (error) {
      setStatus("error")
      toast({
        title: "Verification failed",
        description: "Failed to verify your email. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resendVerification = async () => {
    try {
      // Replace with actual API call to your backend
      // await fetch('/api/auth/resend-verification', { method: 'POST' })

      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Verification email sent",
        description: "Please check your email for a new verification link.",
      })
    } catch (error) {
      toast({
        title: "Failed to resend",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {status === "loading" && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
              {status === "success" && <CheckCircle className="h-12 w-12 text-green-500" />}
              {(status === "error" || status === "expired") && <XCircle className="h-12 w-12 text-red-500" />}
            </div>

            <CardTitle>
              {status === "loading" && "Verifying your email..."}
              {status === "success" && "Email verified!"}
              {status === "error" && "Verification failed"}
              {status === "expired" && "Link expired"}
            </CardTitle>

            <CardDescription>
              {status === "loading" && "Please wait while we verify your email address."}
              {status === "success" && "Your email has been successfully verified. You can now access all features."}
              {status === "error" && "The verification link is invalid or has already been used."}
              {status === "expired" && "The verification link has expired. Please request a new one."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {status === "success" && (
              <div className="space-y-4">
                <Link href="/login">
                  <Button className="w-full">Continue to Login</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Go to Homepage
                  </Button>
                </Link>
              </div>
            )}

            {(status === "error" || status === "expired") && (
              <div className="space-y-4">
                <Button onClick={resendVerification} className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </Button>
                <Link href="/register">
                  <Button variant="outline" className="w-full">
                    Back to Registration
                  </Button>
                </Link>
              </div>
            )}

            {status === "loading" && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">This may take a few moments...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
