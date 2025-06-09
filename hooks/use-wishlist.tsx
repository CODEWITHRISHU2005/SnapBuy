"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface WishlistItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  dateAdded?: string
}

interface WishlistStore {
  wishlist: WishlistItem[]
  isLoading: boolean
  error: string | null
  addToWishlist: (product: WishlistItem) => Promise<void>
  removeFromWishlist: (id: number) => Promise<void>
  isInWishlist: (id: number) => boolean
  clearWishlist: () => Promise<void>
  fetchWishlist: () => Promise<void>
  syncWithBackend: () => Promise<void>
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlist: [],
      isLoading: false,
      error: null,

      addToWishlist: async (product) => {
        const state = get()
        const isAlreadyInWishlist = state.wishlist.some((item) => item.id === product.id)

        if (isAlreadyInWishlist) return

        set({ isLoading: true, error: null })

        try {
          const response = await fetch("/api/wishlist/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: JSON.stringify({ productId: product.id }),
          })

          if (!response.ok) {
            throw new Error("Failed to add item to wishlist")
          }

          const updatedWishlist = await response.json()
          set({ wishlist: updatedWishlist.items, isLoading: false })
        } catch (error) {
          // Fallback to local state
          const productWithDate = {
            ...product,
            dateAdded: new Date().toISOString(),
          }

          set((state) => ({
            wishlist: [...state.wishlist, productWithDate],
            isLoading: false,
            error: "Added to wishlist locally. Will sync when online.",
          }))
        }
      },

      removeFromWishlist: async (id) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch(`/api/wishlist/remove/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          })

          if (!response.ok) {
            throw new Error("Failed to remove item from wishlist")
          }

          const updatedWishlist = await response.json()
          set({ wishlist: updatedWishlist.items, isLoading: false })
        } catch (error) {
          // Fallback to local state
          set((state) => ({
            wishlist: state.wishlist.filter((item) => item.id !== id),
            isLoading: false,
            error: "Removed locally. Will sync when online.",
          }))
        }
      },

      isInWishlist: (id) => {
        return get().wishlist.some((item) => item.id === id)
      },

      clearWishlist: async () => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch("/api/wishlist/clear", {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          })

          if (!response.ok) {
            throw new Error("Failed to clear wishlist")
          }

          set({ wishlist: [], isLoading: false })
        } catch (error) {
          // Fallback to local state
          set({ wishlist: [], isLoading: false, error: "Cleared locally. Will sync when online." })
        }
      },

      fetchWishlist: async () => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch("/api/wishlist", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          })

          if (!response.ok) {
            throw new Error("Failed to fetch wishlist")
          }

          const wishlistData = await response.json()
          set({ wishlist: wishlistData.items || [], isLoading: false })
        } catch (error) {
          set({
            isLoading: false,
            error: "Failed to load wishlist from server. Using local data.",
          })
        }
      },

      syncWithBackend: async () => {
        const state = get()
        if (state.wishlist.length === 0) return

        try {
          const response = await fetch("/api/wishlist/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: JSON.stringify({ items: state.wishlist }),
          })

          if (response.ok) {
            const syncedWishlist = await response.json()
            set({ wishlist: syncedWishlist.items, error: null })
          }
        } catch (error) {
          console.error("Failed to sync wishlist with backend:", error)
        }
      },
    }),
    {
      name: "wishlist-storage",
      onRehydrateStorage: () => (state) => {
        // Sync with backend when store is rehydrated
        if (state && localStorage.getItem("auth_token")) {
          state.fetchWishlist()
        }
      },
    },
  ),
)
