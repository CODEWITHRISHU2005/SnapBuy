"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { productApi, type Product } from "@/lib/api"

interface SearchFilters {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  inStock?: boolean
  onSale?: boolean
  freeShipping?: boolean
  tags?: string[]
}

interface SearchSuggestion {
  id: string
  text: string
  type: "product" | "category" | "brand" | "query"
  count?: number
}

interface SearchHistory {
  id: string
  query: string
  timestamp: number
  resultsCount: number
}

interface SearchStore {
  // State
  query: string
  results: Product[]
  suggestions: SearchSuggestion[]
  filters: SearchFilters
  sortBy: string
  sortOrder: "asc" | "desc"
  isLoading: boolean
  error: string | null
  totalResults: number
  currentPage: number
  totalPages: number
  searchHistory: SearchHistory[]
  popularSearches: string[]
  recentSearches: string[]

  // Actions
  setQuery: (query: string) => void
  setFilters: (filters: Partial<SearchFilters>) => void
  setSorting: (sortBy: string, sortOrder: "asc" | "desc") => void
  search: (query: string, page?: number) => Promise<void>
  getSuggestions: (query: string) => Promise<void>
  clearFilters: () => void
  clearHistory: () => void
  addToHistory: (query: string, resultsCount: number) => void
  removeFromHistory: (id: string) => void
  getPopularSearches: () => Promise<void>
}

export const useSearch = create<SearchStore>()(
  persist(
    (set, get) => ({
      // Initial state
      query: "",
      results: [],
      suggestions: [],
      filters: {},
      sortBy: "name",
      sortOrder: "asc",
      isLoading: false,
      error: null,
      totalResults: 0,
      currentPage: 1,
      totalPages: 1,
      searchHistory: [],
      popularSearches: [],
      recentSearches: [],

      setQuery: (query) => set({ query }),

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1,
        }))
        // Auto-search when filters change
        const { query } = get()
        if (query) {
          get().search(query, 1)
        }
      },

      setSorting: (sortBy, sortOrder) => {
        set({ sortBy, sortOrder, currentPage: 1 })
        // Auto-search when sorting changes
        const { query } = get()
        if (query) {
          get().search(query, 1)
        }
      },

      search: async (searchQuery, page = 1) => {
        set({ isLoading: true, error: null, query: searchQuery, currentPage: page })

        try {
          const response = await productApi.search(searchQuery)

          if (!response.success) {
            throw new Error(response.error || "Search failed")
          }

          const products = response.data || []
          const { filters } = get()

          // Apply client-side filtering
          let filteredProducts = products.filter((product: Product) => {
            if (filters.category && product.category !== filters.category) return false
            if (filters.brand && product.brand !== filters.brand) return false
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

          // Implement pagination (20 items per page)
          const limit = 20
          const startIndex = (page - 1) * limit
          const endIndex = startIndex + limit
          const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

          set({
            results: paginatedProducts,
            totalResults: filteredProducts.length,
            totalPages: Math.ceil(filteredProducts.length / limit),
            isLoading: false,
          })

          // Add to search history
          get().addToHistory(searchQuery, filteredProducts.length)
        } catch (error) {
          console.error("Search failed:", error)
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Search failed",
          })
        }
      },

      getSuggestions: async (query) => {
        if (query.length < 2) {
          set({ suggestions: [] })
          return
        }

        try {
          // For now, we'll generate suggestions from the search results
          const response = await productApi.search(query)
          
          if (response.success && response.data) {
            const products = response.data
            const suggestions: SearchSuggestion[] = []
            
            // Add product name suggestions
            products.slice(0, 3).forEach((product, index) => {
              suggestions.push({
                id: `product-${index}`,
                text: product.name,
                type: "product",
                count: 1
              })
            })
            
            // Add brand suggestions
            const brands = [...new Set(products.map(p => p.brand))].slice(0, 2)
            brands.forEach((brand, index) => {
              suggestions.push({
                id: `brand-${index}`,
                text: brand,
                type: "brand",
                count: products.filter(p => p.brand === brand).length
              })
            })
            
            // Add category suggestions
            const categories = [...new Set(products.map(p => p.category))].slice(0, 2)
            categories.forEach((category, index) => {
              suggestions.push({
                id: `category-${index}`,
                text: category,
                type: "category",
                count: products.filter(p => p.category === category).length
              })
            })

            set({ suggestions })
          }
        } catch (error) {
          console.error("Failed to get suggestions:", error)
        }
      },

      clearFilters: () => {
        set({ filters: {}, currentPage: 1 })
        const { query } = get()
        if (query) {
          get().search(query, 1)
        }
      },

      clearHistory: () => set({ searchHistory: [] }),

      addToHistory: (query, resultsCount) => {
        const history = get().searchHistory
        const newEntry: SearchHistory = {
          id: Date.now().toString(),
          query,
          timestamp: Date.now(),
          resultsCount,
        }

        // Remove duplicate and add to beginning
        const filteredHistory = history.filter((item) => item.query !== query)
        const updatedHistory = [newEntry, ...filteredHistory].slice(0, 10) // Keep only 10 recent searches

        set({
          searchHistory: updatedHistory,
          recentSearches: updatedHistory.map((item) => item.query).slice(0, 5),
        })
      },

      removeFromHistory: (id) => {
        set((state) => ({
          searchHistory: state.searchHistory.filter((item) => item.id !== id),
        }))
      },

      getPopularSearches: async () => {
        try {
          // Generate popular searches from current products
          const response = await productApi.getAll()
          
          if (response.success && response.data) {
            const products = response.data
            const brands = [...new Set(products.map(p => p.brand))].slice(0, 5)
            const categories = [...new Set(products.map(p => p.category))].slice(0, 5)
            
            const popular = [...brands, ...categories].slice(0, 8)
            set({ popularSearches: popular })
          }
        } catch (error) {
          console.error("Failed to get popular searches:", error)
        }
      },
    }),
    {
      name: "search-store",
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        recentSearches: state.recentSearches,
      }),
    },
  ),
)