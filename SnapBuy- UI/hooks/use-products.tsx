"use client"

import { create } from "zustand"
import { productApi, type Product } from "@/lib/api"

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
  createProduct: (productData: FormData) => Promise<boolean>
  updateProduct: (id: number, productData: FormData) => Promise<boolean>
  deleteProduct: (id: number) => Promise<boolean>
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
  sortBy: "name",
  sortOrder: "asc",

  fetchProducts: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null })

    try {
      const { filters } = get()
      
      // Build query parameters
      const params: Record<string, string> = {}
      
      if (filters.category) params.category = filters.category
      if (filters.brand) params.brand = filters.brand
      if (filters.search) params.search = filters.search

      const response = await productApi.getAll(params)

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch products")
      }

      const products = response.data || []
      
      // Apply client-side filtering
      let filteredProducts = products.filter((product: Product) => {
        if (filters.minPrice && product.price < filters.minPrice) return false
        if (filters.maxPrice && product.price > filters.maxPrice) return false
        if (filters.inStock && product.stock <= 0) return false
        if (filters.rating && (!product.rating || product.rating < filters.rating)) return false
        return true
      })

      // Apply client-side sorting
      const { sortBy, sortOrder } = get()
      filteredProducts.sort((a, b) => {
        let aValue: any = a[sortBy as keyof Product]
        let bValue: any = b[sortBy as keyof Product]
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })

      // Implement client-side pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

      set({
        products: products,
        filteredProducts: paginatedProducts,
        currentPage: page,
        totalPages: Math.ceil(filteredProducts.length / limit),
        totalProducts: filteredProducts.length,
        isLoading: false,
      })
    } catch (error) {
      console.error("Failed to fetch products:", error)
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch products",
      })
    }
  },

  fetchProductById: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const response = await productApi.getById(id)

      if (!response.success) {
        throw new Error(response.error || "Product not found")
      }

      set({ isLoading: false })
      return response.data || null
    } catch (error) {
      console.error("Failed to fetch product:", error)
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
      const response = await productApi.search(query)

      if (!response.success) {
        throw new Error(response.error || "Search failed")
      }

      const products = response.data || []
      const filters = { ...get().filters, ...additionalFilters, search: query }

      // Apply additional filters
      let filteredProducts = products.filter((product: Product) => {
        if (filters.category && product.category !== filters.category) return false
        if (filters.brand && product.brand !== filters.brand) return false
        if (filters.minPrice && product.price < filters.minPrice) return false
        if (filters.maxPrice && product.price > filters.maxPrice) return false
        if (filters.inStock && product.stock <= 0) return false
        if (filters.rating && (!product.rating || product.rating < filters.rating)) return false
        return true
      })

      set({
        filteredProducts: filteredProducts,
        totalProducts: filteredProducts.length,
        filters: { ...filters },
        isLoading: false,
      })
    } catch (error) {
      console.error("Search failed:", error)
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

  createProduct: async (productData) => {
    set({ isLoading: true, error: null })

    try {
      const response = await productApi.create(productData)

      if (!response.success) {
        throw new Error(response.error || "Failed to create product")
      }

      set({ isLoading: false })
      
      // Refresh the products list
      await get().refreshProducts()
      
      return true
    } catch (error) {
      console.error("Failed to create product:", error)
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to create product",
      })
      return false
    }
  },

  updateProduct: async (id, productData) => {
    set({ isLoading: true, error: null })

    try {
      const response = await productApi.update(id, productData)

      if (!response.success) {
        throw new Error(response.error || "Failed to update product")
      }

      set({ isLoading: false })
      
      // Refresh the products list
      await get().refreshProducts()
      
      return true
    } catch (error) {
      console.error("Failed to update product:", error)
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to update product",
      })
      return false
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const response = await productApi.delete(id)

      if (!response.success) {
        throw new Error(response.error || "Failed to delete product")
      }

      set({ isLoading: false })
      
      // Refresh the products list
      await get().refreshProducts()
      
      return true
    } catch (error) {
      console.error("Failed to delete product:", error)
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to delete product",
      })
      return false
    }
  },
}))