"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, X, Package, Plus } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import ProtectedRoute from "@/components/protected-route"
import Image from "next/image"

interface ProductFormData {
  name: string
  brand: string
  description: string
  price: string
  category: string
  stockQuantity: string
  releaseDate: string
  image: File | null
  productAvailable: boolean
  variants: Array<{
    type: string
    name: string
    value: string
    priceModifier: string
    available: boolean
  }>
}

const categories = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "accessories", label: "Accessories" },
  { value: "home", label: "Home & Garden" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "books", label: "Books" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "automotive", label: "Automotive" },
]

const variantTypes = [
  { value: "color", label: "Color" },
  { value: "size", label: "Size" },
  { value: "storage", label: "Storage" },
  { value: "ram", label: "RAM" },
  { value: "kit", label: "Kit" },
]

function AddProductContent() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    brand: "",
    description: "",
    price: "",
    category: "",
    stockQuantity: "",
    releaseDate: "",
    image: null,
    productAvailable: true,
    variants: [],
  })

  const handleInputChange = (field: keyof ProductFormData, value: string | boolean | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleInputChange("image", file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    handleInputChange("image", null)
    setImagePreview(null)
  }

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          type: "",
          name: "",
          value: "",
          priceModifier: "0",
          available: true,
        },
      ],
    }))
  }

  const updateVariant = (index: number, field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) => (i === index ? { ...variant, [field]: value } : variant)),
    }))
  }

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }))
  }

  const validateForm = () => {
    const errors = []

    if (!formData.name.trim()) errors.push("Product name is required")
    if (!formData.brand.trim()) errors.push("Brand is required")
    if (!formData.description.trim()) errors.push("Description is required")
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.push("Valid price is required")
    }
    if (!formData.category) errors.push("Category is required")
    if (!formData.stockQuantity || isNaN(Number(formData.stockQuantity)) || Number(formData.stockQuantity) < 0) {
      errors.push("Valid stock quantity is required")
    }
    if (!formData.releaseDate) errors.push("Release date is required")

    // Validate variants
    formData.variants.forEach((variant, index) => {
      if (!variant.type) errors.push(`Variant ${index + 1}: Type is required`)
      if (!variant.name.trim()) errors.push(`Variant ${index + 1}: Name is required`)
      if (!variant.value.trim()) errors.push(`Variant ${index + 1}: Value is required`)
      if (variant.priceModifier && isNaN(Number(variant.priceModifier))) {
        errors.push(`Variant ${index + 1}: Price modifier must be a number`)
      }
    })

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateForm()
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call - replace with actual backend integration
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Here you would typically:
      // 1. Upload the image to your storage service
      // 2. Create the product in your database
      // 3. Handle the response

      toast({
        title: "Product Added Successfully!",
        description: `${formData.name} has been added to your catalog.`,
      })

      // Reset form
      setFormData({
        name: "",
        brand: "",
        description: "",
        price: "",
        category: "",
        stockQuantity: "",
        releaseDate: "",
        image: null,
        productAvailable: true,
        variants: [],
      })
      setImagePreview(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/admin" className="inline-flex items-center text-sm mb-6 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Admin Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-6 w-6" />
              <span>Add New Product</span>
            </CardTitle>
            <CardDescription>Fill in the details below to add a new product to your catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Product Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    placeholder="Enter your Brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Add product description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Eg: 1000"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Stock, Release Date, and Image */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    placeholder="Stock Remaining"
                    value={formData.stockQuantity}
                    onChange={(e) => handleInputChange("stockQuantity", e.target.value)}
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="releaseDate">Release Date *</Label>
                  <Input
                    id="releaseDate"
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => handleInputChange("releaseDate", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <div className="space-y-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                    />
                    {imagePreview && (
                      <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                        <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={removeImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Variants */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Product Variants (Optional)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                  </Button>
                </div>

                {formData.variants.map((variant, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={variant.type} onValueChange={(value) => updateVariant(index, "type", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {variantTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          placeholder="e.g., Red, Large, 128GB"
                          value={variant.name}
                          onChange={(e) => updateVariant(index, "name", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Value</Label>
                        <Input
                          placeholder="e.g., #ff0000, XL, 128GB"
                          value={variant.value}
                          onChange={(e) => updateVariant(index, "value", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Price Modifier (₹)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={variant.priceModifier}
                          onChange={(e) => updateVariant(index, "priceModifier", e.target.value)}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`available-${index}`}
                            checked={variant.available}
                            onCheckedChange={(checked) => updateVariant(index, "available", checked as boolean)}
                          />
                          <Label htmlFor={`available-${index}`} className="text-sm">
                            Available
                          </Label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariant(index)}
                          className="text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Product Available Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="productAvailable"
                  checked={formData.productAvailable}
                  onCheckedChange={(checked) => handleInputChange("productAvailable", checked as boolean)}
                />
                <Label htmlFor="productAvailable">Product Available</Label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                  {isSubmitting ? "Adding..." : "Submit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function AddProductPage() {
  return (
    <ProtectedRoute>
      <AddProductContent />
    </ProtectedRoute>
  )
}
