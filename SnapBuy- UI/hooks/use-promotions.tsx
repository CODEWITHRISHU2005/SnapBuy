"use client"

import { create } from "zustand"

export interface PromotionalBanner {
  id: number
  title: string
  subtitle?: string
  description?: string
  discountText: string
  promoCode?: string
  backgroundImage: string
  category: string
  ctaText: string
  ctaLink: string
  brandLogo?: string
  partnerLogos?: string[]
  isActive: boolean
  startDate?: string
  endDate?: string
  priority: number
}

export interface FeaturedSection {
  id: number
  title: string
  subtitle?: string
  type: "products" | "categories" | "brands"
  items: any[]
  layout: "grid" | "carousel" | "banner"
  isActive: boolean
}

interface PromotionsStore {
  banners: PromotionalBanner[]
  featuredSections: FeaturedSection[]
  isLoading: boolean
  error: string | null
  currentBannerIndex: number

  // Actions
  fetchPromotions: () => Promise<void>
  fetchFeaturedSections: () => Promise<void>
  setCurrentBanner: (index: number) => void
  nextBanner: () => void
  previousBanner: () => void
  refreshPromotions: () => Promise<void>
}

export const usePromotions = create<PromotionsStore>((set, get) => ({
  banners: [],
  featuredSections: [],
  isLoading: false,
  error: null,
  currentBannerIndex: 0,

  fetchPromotions: async () => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch("/api/promotions/banners", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Always fetch fresh data
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Validate the response structure
      if (!data || !Array.isArray(data.banners)) {
        throw new Error("Invalid response format from banners API")
      }

      // Process banners to ensure all required fields are present
      const processedBanners = data.banners
        .filter((banner: any) => banner.isActive !== false)
        .map((banner: any) => ({
          id: banner.id,
          title: banner.title || "Promotional Banner",
          subtitle: banner.subtitle,
          description: banner.description,
          discountText: banner.discountText || "Special Offer",
          promoCode: banner.promoCode,
          backgroundImage: banner.backgroundImage || "/placeholder.svg?height=500&width=1200",
          category: banner.category || "General",
          ctaText: banner.ctaText || "Shop Now",
          ctaLink: banner.ctaLink || "/products",
          brandLogo: banner.brandLogo,
          partnerLogos: banner.partnerLogos || [],
          isActive: banner.isActive !== false,
          startDate: banner.startDate,
          endDate: banner.endDate,
          priority: banner.priority || 0,
        }))
        .sort((a: PromotionalBanner, b: PromotionalBanner) => a.priority - b.priority)

      set({
        banners: processedBanners,
        isLoading: false,
        error: null,
      })

      console.log(`✅ Successfully loaded ${processedBanners.length} promotional banners`)
    } catch (error) {
      console.error("❌ Failed to fetch promotional banners:", error)

      set({
        banners: [],
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch promotions",
      })
    }
  },

  fetchFeaturedSections: async () => {
    try {
      const response = await fetch("/api/promotions/featured", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data || !Array.isArray(data.sections)) {
        throw new Error("Invalid response format from featured sections API")
      }

      const processedSections = data.sections
        .filter((section: any) => section.isActive !== false)
        .map((section: any) => ({
          id: section.id,
          title: section.title || "Featured Section",
          subtitle: section.subtitle,
          type: section.type || "products",
          items: section.items || [],
          layout: section.layout || "grid",
          isActive: section.isActive !== false,
        }))

      set({
        featuredSections: processedSections,
      })

      console.log(`✅ Successfully loaded ${processedSections.length} featured sections`)
    } catch (error) {
      console.error("❌ Failed to fetch featured sections:", error)

      // Set empty array on error instead of fallback data
      set({
        featuredSections: [],
      })
    }
  },

  refreshPromotions: async () => {
    const { fetchPromotions, fetchFeaturedSections } = get()
    await Promise.all([fetchPromotions(), fetchFeaturedSections()])
  },

  setCurrentBanner: (index) => {
    const { banners } = get()
    if (index >= 0 && index < banners.length) {
      set({ currentBannerIndex: index })
    }
  },

  nextBanner: () => {
    const { banners, currentBannerIndex } = get()
    if (banners.length === 0) return
    const nextIndex = (currentBannerIndex + 1) % banners.length
    set({ currentBannerIndex: nextIndex })
  },

  previousBanner: () => {
    const { banners, currentBannerIndex } = get()
    if (banners.length === 0) return
    const prevIndex = currentBannerIndex === 0 ? banners.length - 1 : currentBannerIndex - 1
    set({ currentBannerIndex: prevIndex })
  },
}))
