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
import { useProducts } from "@/hooks/use-products"
import { useRouter } from "next/navigation"

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
  { value: "toys", label: "Toys" },
  { value: "phone", label: "Phones" },
  { value: "laptop", label: "Laptops" },
  { value: "fashion", label: "Fashion" },
]

function AddProductContent() {
  const { toast } = useToast()
  const { createProduct, isLoading } = useProducts()
  const router = useRouter()
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

    try {
      // Create FormData for backend submission
      const productFormData = new FormData()
      
      // Create product object
      const productData = {
        name: formData.name,
        brand: formData.brand,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stockQuantity: parseInt(formData.stockQuantity),
        releaseDate: formData.releaseDate,
        productAvailable: formData.productAvailable,
      }

      // Add product data as JSON string
      productFormData.append("product", JSON.stringify(productData))
      
      // Add image file
      if (formData.image) {
        productFormData.append("imageFile", formData.image)
      } else {
        // Create a placeholder file if no image is provided
        const placeholderBlob = new Blob(['placeholder'], { type: 'text/plain' })
        const placeholderFile = new File([placeholderBlob], 'placeholder.txt', { type: 'text/plain' })
        productFormData.append("imageFile", placeholderFile)
      }

      const success = await createProduct(productFormData)

      if (success) {
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
        })
        setImagePreview(null)

        // Redirect to admin dashboard
        router.push("/admin")
      } else {
        toast({
          title: "Error",
          description: "Failed to add product. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      })
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
                <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                  {isLoading ? "Adding..." : "Submit"}
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