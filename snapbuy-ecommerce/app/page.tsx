"use client"

import { useEffect } from "react"
import PromotionalBanner from "@/components/promotional-banner"
import FeaturedSections from "@/components/featured-sections"
import RecentlyViewed from "@/components/recently-viewed"
import { useProducts } from "@/hooks/use-products"

export default function Home() {
  const { fetchProducts } = useProducts()

  useEffect(() => {
    // Fetch initial products for the homepage
    fetchProducts(1, 20)
  }, [])

  return (
    <div className="space-y-12">
      {/* Hero Promotional Banner */}
      <PromotionalBanner />

      {/* Featured Sections */}
      <FeaturedSections />

      {/* Recently Viewed Products */}
      <RecentlyViewed />
    </div>
  )
}
