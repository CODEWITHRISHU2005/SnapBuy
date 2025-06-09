"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CartItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  quantity: number
  selectedVariants?: Record<string, any>
}

interface CartStore {
  cart: CartItem[]
  isLoading: boolean
  error: string | null
  addToCart: (product: CartItem) => Promise<void>
  removeFromCart: (id: number) => Promise<void>
  updateQuantity: (id: number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  syncWithBackend: () => Promise<void>
  fetchCart: () => Promise<void>
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      isLoading: false,
      error: null,

      addToCart: async (product) => {
        set({ isLoading: true, error: null })

        try {
          // API call to add item to cart
          const response = await fetch("/api/cart/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: JSON.stringify({
              productId: product.id,
              quantity: product.quantity,
              selectedVariants: product.selectedVariants,
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to add item to cart")
          }

          const updatedCart = await response.json()

          // Update local state with server response
          set({ cart: updatedCart.items, isLoading: false })
        } catch (error) {
          // Fallback to local state if API fails
          const state = get()
          const existingItem = state.cart.find((item) => item.id === product.id)

          if (existingItem) {
            set({
              cart: state.cart.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + product.quantity } : item,
              ),
              isLoading: false,
              error: "Added to cart locally. Will sync when online.",
            })
          } else {
            set({
              cart: [...state.cart, product],
              isLoading: false,
              error: "Added to cart locally. Will sync when online.",
            })
          }
        }
      },

      removeFromCart: async (id) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch(`/api/cart/remove/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          })

          if (!response.ok) {
            throw new Error("Failed to remove item from cart")
          }

          const updatedCart = await response.json()
          set({ cart: updatedCart.items, isLoading: false })
        } catch (error) {
          // Fallback to local state
          set((state) => ({
            cart: state.cart.filter((item) => item.id !== id),
            isLoading: false,
            error: "Removed locally. Will sync when online.",
          }))
        }
      },

      updateQuantity: async (id, quantity) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch(`/api/cart/update/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: JSON.stringify({ quantity }),
          })

          if (!response.ok) {
            throw new Error("Failed to update cart item")
          }

          const updatedCart = await response.json()
          set({ cart: updatedCart.items, isLoading: false })
        } catch (error) {
          // Fallback to local state
          set((state) => ({
            cart: state.cart.map((item) => (item.id === id ? { ...item, quantity } : item)),
            isLoading: false,
            error: "Updated locally. Will sync when online.",
          }))
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch("/api/cart/clear", {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          })

          if (!response.ok) {
            throw new Error("Failed to clear cart")
          }

          set({ cart: [], isLoading: false })
        } catch (error) {
          // Fallback to local state
          set({ cart: [], isLoading: false, error: "Cleared locally. Will sync when online." })
        }
      },

      fetchCart: async () => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch("/api/cart", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          })

          if (!response.ok) {
            throw new Error("Failed to fetch cart")
          }

          const cartData = await response.json()
          set({ cart: cartData.items || [], isLoading: false })
        } catch (error) {
          set({
            isLoading: false,
            error: "Failed to load cart from server. Using local data.",
          })
        }
      },

      syncWithBackend: async () => {
        const state = get()
        if (state.cart.length === 0) return

        try {
          const response = await fetch("/api/cart/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: JSON.stringify({ items: state.cart }),
          })

          if (response.ok) {
            const syncedCart = await response.json()
            set({ cart: syncedCart.items, error: null })
          }
        } catch (error) {
          console.error("Failed to sync cart with backend:", error)
        }
      },
    }),
    {
      name: "cart-storage",
      onRehydrateStorage: () => (state) => {
        // Sync with backend when store is rehydrated
        if (state && localStorage.getItem("auth_token")) {
          state.fetchCart()
        }
      },
    },
  ),
)
