"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Shield, Bell, Mail, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AccountSettings() {
  const { toast } = useToast()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isResendingVerification, setIsResendingVerification] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailPromotions: false,
    emailSecurity: true,
    pushNotifications: true,
  })

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)

    // Simulate API call - replace with actual backend call
    try {
      // await fetch('/api/auth/change-password', { ... })
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      })

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast({
        title: "Password change failed",
        description: "Current password is incorrect.",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleResendVerification = async () => {
    setIsResendingVerification(true)

    // Simulate API call - replace with actual backend call
    try {
      // await fetch('/api/auth/resend-verification', { ... })
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link.",
      })
    } catch (error) {
      toast({
        title: "Failed to send email",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsResendingVerification(false)
    }
  }

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))

    // Simulate API call - replace with actual backend call
    // fetch('/api/user/notifications', { method: 'PUT', body: JSON.stringify({ [key]: value }) })

    toast({
      title: "Notification settings updated",
      description: "Your preferences have been saved.",
    })
  }

  const handleDeleteAccount = async () => {
    // Simulate API call - replace with actual backend call
    try {
      // await fetch('/api/user/delete', { method: 'DELETE' })
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      })

      // Redirect to home page or logout
      window.location.href = "/"
    } catch (error) {
      toast({
        title: "Failed to delete account",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Email Verification</span>
          </CardTitle>
          <CardDescription>Verify your email address to secure your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Status</p>
              <p className="text-sm text-muted-foreground">
                Your email address is not verified. Please check your inbox.
              </p>
            </div>
            <Button onClick={handleResendVerification} disabled={isResendingVerification} variant="outline">
              {isResendingVerification ? "Sending..." : "Resend Verification"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security</span>
          </CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="w-full justify-start">
            Two-Factor Authentication
          </Button>

          <Button variant="outline" className="w-full justify-start">
            Login Sessions
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
          <CardDescription>Choose what notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Order Updates</p>
              <p className="text-sm text-muted-foreground">Get notified about your order status</p>
            </div>
            <Switch
              checked={notifications.emailOrders}
              onCheckedChange={(checked) => handleNotificationChange("emailOrders", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Promotional Emails</p>
              <p className="text-sm text-muted-foreground">Receive offers and product recommendations</p>
            </div>
            <Switch
              checked={notifications.emailPromotions}
              onCheckedChange={(checked) => handleNotificationChange("emailPromotions", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Security Alerts</p>
              <p className="text-sm text-muted-foreground">Important security notifications</p>
            </div>
            <Switch
              checked={notifications.emailSecurity}
              onCheckedChange={(checked) => handleNotificationChange("emailSecurity", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) => handleNotificationChange("pushNotifications", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove all your data from
                  our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
