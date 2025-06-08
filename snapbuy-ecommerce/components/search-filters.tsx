"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Filter } from "lucide-react"
import { useSearch } from "@/hooks/use-search"

const categories = [
  "Electronics",
  "Clothing",
  "Accessories",
  "Home & Garden",
  "Sports",
  "Books",
  "Beauty",
  "Automotive",
  "Toys",
  "Health",
]

const brands = [
  "Apple",
  "Samsung",
  "Nike",
  "Adidas",
  "Sony",
  "Microsoft",
  "Google",
  "Amazon",
  "Dell",
  "HP",
  "Canon",
  "Nikon",
]

const ratings = [
  { value: 4, label: "4+ Stars" },
  { value: 3, label: "3+ Stars" },
  { value: 2, label: "2+ Stars" },
  { value: 1, label: "1+ Stars" },
]

export function SearchFilters() {
  const { filters, setFilters, clearFilters } = useSearch()
  const [priceRange, setPriceRange] = useState([filters.minPrice || 0, filters.maxPrice || 5000])
  const [isOpen, setIsOpen] = useState(false)

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values)
    setFilters({
      minPrice: values[0],
      maxPrice: values[1],
    })
  }

  const handleCategoryChange = (category: string) => {
    setFilters({
      category: filters.category === category ? undefined : category,
    })
  }

  const handleBrandChange = (brand: string) => {
    setFilters({
      brand: filters.brand === brand ? undefined : brand,
    })
  }

  const handleRatingChange = (rating: number) => {
    setFilters({
      rating: filters.rating === rating ? undefined : rating,
    })
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter((value) => value !== undefined && value !== "" && value !== false).length
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </CardTitle>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 pt-4">
            <CardContent className="p-0 space-y-6">
              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Price Range</Label>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    max={5000}
                    min={0}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Category</Label>
                <Select value={filters.category || ""} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Brand</Label>
                <Select value={filters.brand || ""} onValueChange={handleBrandChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Minimum Rating</Label>
                <div className="space-y-2">
                  {ratings.map((rating) => (
                    <div key={rating.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rating-${rating.value}`}
                        checked={filters.rating === rating.value}
                        onCheckedChange={() => handleRatingChange(rating.value)}
                      />
                      <Label htmlFor={`rating-${rating.value}`} className="text-sm">
                        {rating.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Filters */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Additional Filters</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="in-stock"
                      checked={filters.inStock || false}
                      onCheckedChange={(checked) => setFilters({ inStock: checked as boolean })}
                    />
                    <Label htmlFor="in-stock" className="text-sm">
                      In Stock Only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="on-sale"
                      checked={filters.onSale || false}
                      onCheckedChange={(checked) => setFilters({ onSale: checked as boolean })}
                    />
                    <Label htmlFor="on-sale" className="text-sm">
                      On Sale
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="free-shipping"
                      checked={filters.freeShipping || false}
                      onCheckedChange={(checked) => setFilters({ freeShipping: checked as boolean })}
                    />
                    <Label htmlFor="free-shipping" className="text-sm">
                      Free Shipping
                    </Label>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  )
}
