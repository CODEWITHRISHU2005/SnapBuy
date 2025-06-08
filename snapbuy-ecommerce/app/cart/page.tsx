"use client"

import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Trash2, Minus, Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()
  const [isUpdating, setIsUpdating] = useState<number | null>(null)

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  const handleQuantityChange = (id: number, newQuantity: number) => {
    setIsUpdating(id)
    setTimeout(() => {
      updateQuantity(id, newQuantity)
      setIsUpdating(null)
    }, 300)
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added any products to your cart yet.</p>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg shadow-sm">
            <div className="hidden md:grid grid-cols-12 p-4 border-b text-sm font-medium">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Total</div>
            </div>

            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-12 p-4 border-b items-center"
              >
                <div className="col-span-6 flex items-center gap-4 mb-4 md:mb-0">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.brand}</p>
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-between md:justify-center items-center mb-2 md:mb-0">
                  <span className="md:hidden font-medium">Price:</span>
                  <span>{formatCurrency(item.price)}</span>
                </div>

                <div className="md:col-span-2 flex justify-between md:justify-center items-center mb-2 md:mb-0">
                  <span className="md:hidden font-medium">Quantity:</span>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-r-none"
                      onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                      disabled={isUpdating === item.id}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <div className="h-8 px-3 flex items-center justify-center border-y">
                      {isUpdating === item.id ? "..." : item.quantity}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-l-none"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={isUpdating === item.id}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-between md:justify-center items-center">
                  <div className="flex items-center justify-between w-full md:w-auto">
                    <span className="md:hidden font-medium">Total:</span>
                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive md:ml-4"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={clearCart}>
              Clear Cart
            </Button>
            <Link href="/">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(subtotal * 0.18)}</span>
              </div>
              <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                <span>Total</span>
                <span>{formatCurrency(subtotal * 1.18)}</span>
              </div>
            </div>

            <Link href="/checkout">
              <Button className="w-full">Proceed to Checkout</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
