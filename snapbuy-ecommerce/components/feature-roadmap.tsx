"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Clock, AlertTriangle } from "lucide-react"

interface Feature {
  name: string
  description: string
  priority: "critical" | "high" | "medium" | "low"
  status: "completed" | "in-progress" | "planned" | "missing"
  category: string
}

const features: Feature[] = [
  // Security & Authentication
  {
    name: "Two-Factor Authentication",
    description: "SMS/Email 2FA for enhanced security",
    priority: "critical",
    status: "missing",
    category: "Security",
  },
  {
    name: "Password Reset",
    description: "Secure password reset via email",
    priority: "critical",
    status: "missing",
    category: "Security",
  },
  {
    name: "Email Verification",
    description: "Verify user emails on registration",
    priority: "high",
    status: "in-progress",
    category: "Security",
  },

  // Payment & Checkout
  {
    name: "Payment Gateway",
    description: "Stripe/PayPal integration",
    priority: "critical",
    status: "missing",
    category: "Payment",
  },
  {
    name: "Guest Checkout",
    description: "Allow checkout without registration",
    priority: "high",
    status: "missing",
    category: "Payment",
  },
  {
    name: "Tax Calculation",
    description: "Dynamic tax calculation by location",
    priority: "high",
    status: "missing",
    category: "Payment",
  },

  // Order Management
  {
    name: "Order Tracking",
    description: "Real-time order status updates",
    priority: "critical",
    status: "missing",
    category: "Orders",
  },
  {
    name: "Return/Exchange",
    description: "Handle returns and exchanges",
    priority: "high",
    status: "missing",
    category: "Orders",
  },
  {
    name: "Invoice Generation",
    description: "Generate PDF invoices",
    priority: "medium",
    status: "missing",
    category: "Orders",
  },

  // Search & Discovery
  {
    name: "Advanced Search",
    description: "Elasticsearch with filters",
    priority: "high",
    status: "missing",
    category: "Search",
  },
  {
    name: "Auto-complete",
    description: "Search suggestions",
    priority: "medium",
    status: "missing",
    category: "Search",
  },

  // Mobile Experience
  {
    name: "PWA Support",
    description: "Progressive Web App features",
    priority: "high",
    status: "missing",
    category: "Mobile",
  },
  {
    name: "Push Notifications",
    description: "Order updates and promotions",
    priority: "medium",
    status: "missing",
    category: "Mobile",
  },

  // Analytics
  {
    name: "Google Analytics",
    description: "Track user behavior",
    priority: "high",
    status: "missing",
    category: "Analytics",
  },
  {
    name: "A/B Testing",
    description: "Test different features",
    priority: "medium",
    status: "missing",
    category: "Analytics",
  },

  // Performance
  {
    name: "CDN Integration",
    description: "Fast image delivery",
    priority: "high",
    status: "missing",
    category: "Performance",
  },
  {
    name: "Caching Strategy",
    description: "Redis caching",
    priority: "high",
    status: "missing",
    category: "Performance",
  },

  // Marketing
  {
    name: "Email Marketing",
    description: "Newsletter and campaigns",
    priority: "medium",
    status: "missing",
    category: "Marketing",
  },
  {
    name: "Loyalty Program",
    description: "Reward repeat customers",
    priority: "medium",
    status: "missing",
    category: "Marketing",
  },

  // Customer Support
  {
    name: "Live Chat",
    description: "Real-time customer support",
    priority: "high",
    status: "missing",
    category: "Support",
  },
  {
    name: "Help Center",
    description: "FAQ and documentation",
    priority: "medium",
    status: "missing",
    category: "Support",
  },

  // Completed Features
  {
    name: "User Authentication",
    description: "Login/Register system",
    priority: "critical",
    status: "completed",
    category: "Security",
  },
  {
    name: "Product Catalog",
    description: "Product listing and details",
    priority: "critical",
    status: "completed",
    category: "Core",
  },
  {
    name: "Shopping Cart",
    description: "Add/remove items",
    priority: "critical",
    status: "completed",
    category: "Core",
  },
  {
    name: "Wishlist",
    description: "Save favorite products",
    priority: "medium",
    status: "completed",
    category: "Core",
  },
  {
    name: "Product Reviews",
    description: "Customer reviews and ratings",
    priority: "medium",
    status: "completed",
    category: "Core",
  },
  {
    name: "Admin Dashboard",
    description: "Basic admin functionality",
    priority: "high",
    status: "completed",
    category: "Admin",
  },
]

const priorityColors = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
}

const statusIcons = {
  completed: CheckCircle,
  "in-progress": Clock,
  planned: Circle,
  missing: AlertTriangle,
}

const statusColors = {
  completed: "text-green-500",
  "in-progress": "text-blue-500",
  planned: "text-gray-500",
  missing: "text-red-500",
}

export default function FeatureRoadmap() {
  const categories = [...new Set(features.map((f) => f.category))]
  const completedFeatures = features.filter((f) => f.status === "completed").length
  const totalFeatures = features.length
  const completionPercentage = (completedFeatures / totalFeatures) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Development Progress</CardTitle>
          <CardDescription>
            {completedFeatures} of {totalFeatures} features completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={completionPercentage} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">{completionPercentage.toFixed(1)}% complete</p>
        </CardContent>
      </Card>

      {categories.map((category) => {
        const categoryFeatures = features.filter((f) => f.category === category)
        const categoryCompleted = categoryFeatures.filter((f) => f.status === "completed").length

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {category}
                <Badge variant="outline">
                  {categoryCompleted}/{categoryFeatures.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryFeatures.map((feature, index) => {
                  const StatusIcon = statusIcons[feature.status]

                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`h-5 w-5 ${statusColors[feature.status]}`} />
                        <div>
                          <h4 className="font-medium">{feature.name}</h4>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={`${priorityColors[feature.priority]} text-white border-none`}
                        >
                          {feature.priority}
                        </Badge>
                        <Badge variant={feature.status === "completed" ? "default" : "secondary"}>
                          {feature.status.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
