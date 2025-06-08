"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import { products } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"
import { useReviews } from "@/hooks/use-reviews"
import { useAuth } from "@/hooks/use-auth"
import { formatCurrency } from "@/lib/utils"
import { Star, ShoppingCart, ArrowLeft, Heart, Minus, Plus } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import ProductReviews from "@/components/product-reviews"
import ProductVariants from "@/components/product-variants"

export default function ProductPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { addToRecentlyViewed } = useRecentlyViewed()
  const { getAverageRating, getProductReviews } = useReviews()
  const { user } = useAuth()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({})
  const [currentPrice, setCurrentPrice] = useState(0)

  useEffect(() => {
    const productId = Array.isArray(id) ? Number.parseInt(id[0]) : Number.parseInt(id as string)
    const foundProduct = products.find((p) => p.id === productId)

    if (foundProduct) {
      setProduct(foundProduct)
      setCurrentPrice(foundProduct.price)

      // Add to recently viewed
      addToRecentlyViewed({
        id: foundProduct.id,
        name: foundProduct.name,
        brand: foundProduct.brand,
        price: foundProduct.price,
        image: foundProduct.image,
      })
    }

    setLoading(false)
  }, [id, addToRecentlyViewed])

  useEffect(() => {
    if (product) {
      // Calculate price based on selected variants
      let priceModifier = 0
      Object.values(selectedVariants).forEach((variant: any) => {
        if (variant?.priceModifier) {
          priceModifier += variant.priceModifier
        }
      })
      setCurrentPrice(product.price + priceModifier)
    }
  }, [selectedVariants, product])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  const isWishlisted = isInWishlist(product.id)
  const averageRating = getAverageRating(product.id) || product.rating || 0
  const productReviews = getProductReviews(product.id)

  const handleAddToCart = () => {
    if (product.stock === 0) return

    addToCart({
      ...product,
      quantity,
      price: currentPrice,
      selectedVariants,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const getStockStatus = () => {
    if (product.stock === 0) {
      return { text: "Out of Stock", color: "bg-red-500", textColor: "text-red-600" }
    } else if (product.stock <= 5) {
      return { text: `Only ${product.stock} Left`, color: "bg-orange-500", textColor: "text-orange-600" }
    } else if (product.stock <= 10) {
      return { text: "Low Stock", color: "bg-yellow-500", textColor: "text-yellow-600" }
    } else {
      return { text: "In Stock", color: "bg-green-500", textColor: "text-green-600" }
    }
  }

  const stockStatus = getStockStatus()

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/" className="inline-flex items-center text-sm mb-6 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-lg overflow-hidden shadow-sm"
        >
          <div className="relative aspect-square">
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-contain p-8" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground mb-4">~ {product.brand}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleWishlistToggle} className="shrink-0">
              <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </Button>
          </div>

          {/* Stock Status */}
          <div className="mb-4">
            <Badge className={`${stockStatus.color} text-white`}>{stockStatus.text}</Badge>
          </div>

          {/* Rating */}
          {averageRating > 0 && (
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {averageRating} ({productReviews.length} reviews)
              </span>
            </div>
          )}

          <div className="text-3xl font-bold mb-6">{formatCurrency(currentPrice)}</div>

          {/* Product Variants */}
          {product.variants && product.variants.length > 0 && (
            <ProductVariants
              variants={product.variants}
              selectedVariants={selectedVariants}
              onVariantChange={setSelectedVariants}
            />
          )}

          <div className="mb-6">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Quantity</h3>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={product.stock === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-4 w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={product.stock === 0}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button className="flex-1" size="lg" onClick={handleAddToCart} disabled={added || product.stock === 0}>
              {product.stock === 0 ? (
                "Out of Stock"
              ) : added ? (
                "Added to Cart!"
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </>
              )}
            </Button>
            <Link href="/cart" className="flex-1">
              <Button variant="outline" size="lg" className="w-full" disabled={product.stock === 0}>
                Buy Now
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Product Reviews */}
      <ProductReviews productId={product.id} />
    </div>
  )
}
