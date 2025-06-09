"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface RecentlyViewedItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  viewedAt: string
}

interface RecentlyViewedStore {
  recentlyViewed: RecentlyViewedItem[]
  addToRecentlyViewed: (product: Omit<RecentlyViewedItem, "viewedAt">) => void
  clearRecentlyViewed: () => void
}

export const useRecentlyViewed = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      recentlyViewed: [],

      addToRecentlyViewed: (product) =>
        set((state) => {
          // Remove if already exists
          const filtered = state.recentlyViewed.filter((item) => item.id !== product.id)

          // Add to beginning with current timestamp
          const newItem = { ...product, viewedAt: new Date().toISOString() }

          // Keep only last 10 items
          const updated = [newItem, ...filtered].slice(0, 10)

          return { recentlyViewed: updated }
        }),

      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
    }),
    {
      name: "recently-viewed-storage",
    },
  ),
)
