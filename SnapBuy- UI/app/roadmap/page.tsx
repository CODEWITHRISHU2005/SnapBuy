"use client"

import FeatureRoadmap from "@/components/feature-roadmap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RoadmapPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Development Roadmap</h1>
          <p className="text-muted-foreground">Track the progress of SnapBuy features</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Next Steps</CardTitle>
          <CardDescription>Critical features to implement for production readiness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-red-600">🔐 Security First</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Implement 2FA, password reset, and email verification before going live.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-orange-600">💳 Payment Integration</h3>
              <p className="text-sm text-muted-foreground mt-1">Add Stripe/PayPal for processing real transactions.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-blue-600">📦 Order Management</h3>
              <p className="text-sm text-muted-foreground mt-1">Build complete order tracking and management system.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-green-600">🔍 Search Enhancement</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Implement advanced search with filters and suggestions.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-purple-600">📱 Mobile Experience</h3>
              <p className="text-sm text-muted-foreground mt-1">Add PWA support and push notifications.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-indigo-600">⚡ Performance</h3>
              <p className="text-sm text-muted-foreground mt-1">Implement CDN, caching, and monitoring.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FeatureRoadmap />
    </div>
  )
}
