"use client"

import { useWishlist } from "@/hooks/use-wishlist"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (item: any) => {
    addToCart({ ...item, quantity: 1 })
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    })
  }

  const handleRemoveFromWishlist = (id: number, name: string) => {
    removeFromWishlist(id)
    toast({
      title: "Removed from wishlist",
      description: `${name} has been removed from your wishlist.`,
    })
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-6 text-center">
          Save products you love by clicking the heart icon on any product.
        </p>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <div className="flex items-center space-x-4">
          <span className="text-muted-foreground">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
          </span>
          <Button variant="outline" onClick={clearWishlist}>
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden h-full flex flex-col">
              <div className="relative aspect-square bg-muted">
                <Link href={`/product/${item.id}`}>
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-contain p-4 hover:scale-105 transition-transform cursor-pointer"
                  />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <CardContent className="p-4 flex-grow flex flex-col">
                <Link href={`/product/${item.id}`}>
                  <h3 className="font-bold uppercase tracking-tight line-clamp-2 mb-2 hover:underline cursor-pointer">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground mb-4">~ {item.brand}</p>

                <div className="mt-auto">
                  <div className="font-bold text-lg mb-3">{formatCurrency(item.price)}</div>
                  <div className="flex flex-col space-y-2">
                    <Button onClick={() => handleAddToCart(item)} className="w-full" size="sm">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Link href={`/product/${item.id}`}>
                      <Button variant="outline" className="w-full" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
