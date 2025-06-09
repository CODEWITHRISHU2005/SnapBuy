"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

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

interface SearchResult {
  id: number
  name: string
  brand: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  category: string
  inStock: boolean
  tags: string[]
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
  results: SearchResult[]
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
      sortBy: "relevance",
      sortOrder: "desc",
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
          const { filters, sortBy, sortOrder } = get()

          // Build query parameters
          const params = new URLSearchParams({
            q: searchQuery,
            page: page.toString(),
            limit: "20",
            sortBy,
            sortOrder,
            ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "")),
          })

          // Simulate API call (replace with actual API)
          await new Promise((resolve) => setTimeout(resolve, 500))

          // Mock search results
          const mockResults: SearchResult[] = [
            {
              id: 1,
              name: "iPhone 15 Pro",
              brand: "Apple",
              price: 999,
              originalPrice: 1099,
              image: "/placeholder.svg?height=200&width=200",
              rating: 4.8,
              reviews: 1250,
              category: "Electronics",
              inStock: true,
              tags: ["smartphone", "ios", "camera", "5g"],
            },
            {
              id: 2,
              name: 'MacBook Pro 16"',
              brand: "Apple",
              price: 2499,
              image: "/placeholder.svg?height=200&width=200",
              rating: 4.9,
              reviews: 890,
              category: "Electronics",
              inStock: true,
              tags: ["laptop", "macbook", "m3", "professional"],
            },
            // Add more mock results...
          ].filter(
            (product) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
          )

          set({
            results: mockResults,
            totalResults: mockResults.length,
            totalPages: Math.ceil(mockResults.length / 20),
            isLoading: false,
          })

          // Add to search history
          get().addToHistory(searchQuery, mockResults.length)
        } catch (error) {
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
          // Mock suggestions (replace with actual API)
          const mockSuggestions: SearchSuggestion[] = [
            { id: "1", text: "iPhone 15", type: "product", count: 45 },
            { id: "2", text: "iPhone accessories", type: "category", count: 120 },
            { id: "3", text: "Apple", type: "brand", count: 89 },
            { id: "4", text: "iPhone 15 pro max", type: "query", count: 67 },
          ].filter((suggestion) => suggestion.text.toLowerCase().includes(query.toLowerCase()))

          set({ suggestions: mockSuggestions })
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
          // Mock popular searches (replace with actual API)
          const popular = [
            "iPhone",
            "MacBook",
            "AirPods",
            "iPad",
            "Samsung Galaxy",
            "Nike shoes",
            "Adidas",
            "PlayStation",
            "Xbox",
            "Nintendo",
          ]
          set({ popularSearches: popular })
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
