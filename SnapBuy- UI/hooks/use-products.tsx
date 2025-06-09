"use client"

import { create } from "zustand"

interface Product {
  id: number
  name: string
  brand: string
  price: number
  image: string
  description: string
  rating: number
  reviews: number
  category: string
  stock: number
  variants?: Array<{
    id: number
    type: string
    name: string
    value: string
    priceModifier?: number
    available: boolean
  }>
  createdAt: string
  updatedAt: string
}

interface ProductFilters {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  rating?: number
  search?: string
}

interface ProductsStore {
  products: Product[]
  filteredProducts: Product[]
  isLoading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalProducts: number
  filters: ProductFilters
  sortBy: string
  sortOrder: "asc" | "desc"

  // Actions
  fetchProducts: (page?: number, limit?: number) => Promise<void>
  fetchProductById: (id: number) => Promise<Product | null>
  searchProducts: (query: string, filters?: ProductFilters) => Promise<void>
  setFilters: (filters: ProductFilters) => void
  setSorting: (sortBy: string, sortOrder: "asc" | "desc") => void
  clearFilters: () => void
  refreshProducts: () => Promise<void>
}

export const useProducts = create<ProductsStore>((set, get) => ({
  products: [],
  filteredProducts: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  filters: {},
  sortBy: "createdAt",
  sortOrder: "desc",

  fetchProducts: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null })

    try {
      const { filters, sortBy, sortOrder } = get()
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "")),
      })

      const response = await fetch(`/api/products?${queryParams}`)

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()

      set({
        products: data.products || [],
        filteredProducts: data.products || [],
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        totalProducts: data.totalProducts || 0,
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch products",
      })
    }
  },

  fetchProductById: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`/api/products/${id}`)

      if (!response.ok) {
        throw new Error("Product not found")
      }

      const product = await response.json()
      set({ isLoading: false })

      return product
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch product",
      })
      return null
    }
  },

  searchProducts: async (query, additionalFilters = {}) => {
    set({ isLoading: true, error: null })

    try {
      const { sortBy, sortOrder } = get()
      const filters = { ...get().filters, ...additionalFilters, search: query }

      const queryParams = new URLSearchParams({
        sortBy,
        sortOrder,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "")),
      })

      const response = await fetch(`/api/products/search?${queryParams}`)

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()

      set({
        filteredProducts: data.products || [],
        totalProducts: data.totalProducts || 0,
        filters: { ...filters },
        isLoading: false,
      })
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Search failed",
      })
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))

    // Automatically fetch products with new filters
    get().fetchProducts(1)
  },

  setSorting: (sortBy, sortOrder) => {
    set({ sortBy, sortOrder })

    // Automatically fetch products with new sorting
    get().fetchProducts(get().currentPage)
  },

  clearFilters: () => {
    set({ filters: {} })
    get().fetchProducts(1)
  },

  refreshProducts: async () => {
    const { currentPage } = get()
    await get().fetchProducts(currentPage)
  },
}))
