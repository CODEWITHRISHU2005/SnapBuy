"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useSearch } from "@/hooks/use-search"
import { SearchInput } from "@/components/search-input"
import { SearchFilters } from "@/components/search-filters"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { Grid, List, SlidersHorizontal, X } from "lucide-react"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  const {
    results,
    filters,
    sortBy,
    sortOrder,
    isLoading,
    totalResults,
    currentPage,
    totalPages,
    search,
    setSorting,
    setFilters,
    clearFilters,
  } = useSearch()

  useEffect(() => {
    if (query) {
      search(query)
    }
  }, [query, search])

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-")
    setSorting(newSortBy, newSortOrder as "asc" | "desc")
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter((value) => value !== undefined && value !== "" && value !== false).length
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search Header */}
      <div className="mb-6">
        <SearchInput className="mb-4" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{query ? `Search results for "${query}"` : "All Products"}</h1>
            <p className="text-muted-foreground">{isLoading ? "Searching..." : `${totalResults} products found`}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance-desc">Most Relevant</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating-desc">Highest Rated</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
                <SelectItem value="newest-desc">Newest First</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter Toggle */}
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                Category: {filters.category}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ category: undefined })} />
              </Badge>
            )}
            {filters.brand && (
              <Badge variant="secondary" className="gap-1">
                Brand: {filters.brand}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ brand: undefined })} />
              </Badge>
            )}
            {filters.minPrice !== undefined && filters.maxPrice !== undefined && (
              <Badge variant="secondary" className="gap-1">
                Price: ${filters.minPrice} - ${filters.maxPrice}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters({ minPrice: undefined, maxPrice: undefined })}
                />
              </Badge>
            )}
            {filters.rating && (
              <Badge variant="secondary" className="gap-1">
                {filters.rating}+ Stars
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ rating: undefined })} />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters - Desktop */}
        <div className="hidden md:block w-80 flex-shrink-0">
          <SearchFilters />
        </div>

        {/* Mobile Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="fixed inset-0 z-50 md:hidden"
            >
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
              <Card className="absolute left-0 top-0 h-full w-80 overflow-y-auto">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <SearchFilters />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="flex-1">
          {isLoading ? (
            <div
              className={`grid gap-6 ${
                viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              }`}
            >
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <motion.div
              className={`grid gap-6 ${
                viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {results.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium mb-2">No products found</h2>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => search("")}>View All Products</Button>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled={currentPage === 1} onClick={() => search(query, currentPage - 1)}>
                  Previous
                </Button>

                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => search(query, page)}
                    >
                      {page}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => search(query, currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
