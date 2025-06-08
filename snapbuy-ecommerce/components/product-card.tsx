"use client"

import type React from "react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Heart, Star, ShoppingCart, Loader2 } from "lucide-react"

interface ProductCardProps {
  product: {
    id: number
    name: string
    brand: string
    price: number
    image: string
    stock: number
    rating?: number
    reviews?: number
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isLoading: cartLoading } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoading: wishlistLoading } = useWishlist()
  const { toast } = useToast()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)

  const isWishlisted = isInWishlist(product.id)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock === 0) return

    setIsAddingToCart(true)

    try {
      await addToCart({ ...product, quantity: 1 })
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsTogglingWishlist(true)

    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id)
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist.`,
        })
      } else {
        await addToWishlist(product)
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTogglingWishlist(false)
    }
  }

  const getStockStatus = () => {
    if (product.stock === 0) {
      return { text: "Out of Stock", color: "bg-red-500" }
    } else if (product.stock <= 5) {
      return { text: `Only ${product.stock} Left`, color: "bg-orange-500" }
    } else if (product.stock <= 10) {
      return { text: "Low Stock", color: "bg-yellow-500" }
    } else {
      return { text: "In Stock", color: "bg-green-500" }
    }
  }

  const stockStatus = getStockStatus()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Link href={`/product/${product.id}`}>
        <Card className="overflow-hidden h-full flex flex-col relative group">
          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
            onClick={handleWishlistToggle}
            disabled={isTogglingWishlist || wishlistLoading}
          >
            {isTogglingWishlist ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            )}
          </Button>

          {/* Stock Badge */}
          <Badge className={`absolute top-2 left-2 z-10 text-white ${stockStatus.color}`}>{stockStatus.text}</Badge>

          <div className="relative aspect-square bg-muted">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain p-4"
              loading="lazy"
            />
          </div>

          <CardContent className="p-4 flex-grow">
            <h3 className="font-bold uppercase tracking-tight line-clamp-2">{product.name}</h3>
            <p className="text-sm text-muted-foreground">~ {product.brand}</p>

            {/* Rating */}
            {product.rating && product.rating > 0 && (
              <div className="flex items-center mt-2 space-x-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(product.rating!) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {product.rating} {product.reviews && `(${product.reviews})`}
                </span>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-4 pt-0 flex items-center justify-between">
            <div className="font-bold">{formatCurrency(product.price)}</div>
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart || cartLoading || product.stock === 0}
              size="sm"
              className="min-w-[100px]"
            >
              {product.stock === 0 ? (
                "Out of Stock"
              ) : isAddingToCart ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Add to Cart
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}
