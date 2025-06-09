"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Calendar, Package, Truck, CheckCircle, Clock, Eye } from "lucide-react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

interface OrderItem {
  id: number
  name: string
  brand: string
  price: number
  quantity: number
  image: string
}

interface Order {
  id: string
  orderNumber: string
  date: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  items: OrderItem[]
  shippingAddress: {
    name: string
    address: string
    city: string
    state: string
    pincode: string
  }
  trackingNumber?: string
  estimatedDelivery?: string
}

// Mock data - replace with API call to your backend
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "SB-2024-001",
    date: "2024-01-15T10:30:00Z",
    status: "delivered",
    total: 124999,
    trackingNumber: "TRK123456789",
    estimatedDelivery: "2024-01-18",
    items: [
      {
        id: 6,
        name: "Samsung Galaxy S24 Ultra",
        brand: "Samsung",
        price: 124999,
        quantity: 1,
        image: "/placeholder.svg?height=400&width=400",
      },
    ],
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
  },
  {
    id: "2",
    orderNumber: "SB-2024-002",
    date: "2024-01-20T14:15:00Z",
    status: "shipped",
    total: 34294,
    trackingNumber: "TRK987654321",
    estimatedDelivery: "2024-01-25",
    items: [
      {
        id: 5,
        name: "Sony WH-1000XM5 Wireless Headphones",
        brand: "Sony",
        price: 24990,
        quantity: 1,
        image: "/placeholder.svg?height=400&width=400",
      },
      {
        id: 7,
        name: "Nike Air Zoom Pegasus 40",
        brand: "Nike",
        price: 9995,
        quantity: 1,
        image: "/placeholder.svg?height=400&width=400",
      },
    ],
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
  },
  {
    id: "3",
    orderNumber: "SB-2024-003",
    date: "2024-01-22T09:45:00Z",
    status: "processing",
    total: 89900,
    estimatedDelivery: "2024-01-28",
    items: [
      {
        id: 1,
        name: "iPhone 17 Air",
        brand: "Apple",
        price: 89900,
        quantity: 1,
        image: "/placeholder.svg?height=400&width=400",
      },
    ],
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
  },
]

const statusConfig = {
  pending: { color: "bg-yellow-500", icon: Clock, label: "Pending" },
  processing: { color: "bg-blue-500", icon: Package, label: "Processing" },
  shipped: { color: "bg-purple-500", icon: Truck, label: "Shipped" },
  delivered: { color: "bg-green-500", icon: CheckCircle, label: "Delivered" },
  cancelled: { color: "bg-red-500", icon: Clock, label: "Cancelled" },
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call - replace with actual backend call
    const fetchOrders = async () => {
      setLoading(true)
      // await fetch('/api/orders')
      setTimeout(() => {
        setOrders(mockOrders)
        setLoading(false)
      }, 1000)
    }

    fetchOrders()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Loading your orders...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-24 animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>View your past orders and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't placed any orders yet. Start shopping to see your order history here.
            </p>
            <Button>Start Shopping</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>View your past orders and track their status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order, index) => {
            const StatusIcon = statusConfig[order.status].icon
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-2 md:mb-0">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${statusConfig[order.status].color}`}></div>
                      <StatusIcon className="h-4 w-4" />
                      <span className="font-medium">{statusConfig[order.status].label}</span>
                    </div>
                    <Badge variant="outline">{order.orderNumber}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium">Total Amount</p>
                    <p className="text-lg font-bold">{formatCurrency(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Items</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <p className="text-sm font-medium">Tracking Number</p>
                      <p className="text-sm text-muted-foreground font-mono">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>

                {order.estimatedDelivery && (
                  <div className="mb-4">
                    <p className="text-sm font-medium">
                      {order.status === "delivered" ? "Delivered on" : "Estimated Delivery"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
                        <DialogDescription>Placed on {new Date(order.date).toLocaleDateString()}</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-3">Order Status</h4>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${statusConfig[order.status].color}`}></div>
                            <StatusIcon className="h-4 w-4" />
                            <span className="font-medium">{statusConfig[order.status].label}</span>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-3">Items Ordered</h4>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-muted rounded-md overflow-hidden">
                                  <img
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium">{item.name}</h5>
                                  <p className="text-sm text-muted-foreground">{item.brand}</p>
                                  <p className="text-sm">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{formatCurrency(item.price)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-3">Shipping Address</h4>
                          <div className="text-sm text-muted-foreground">
                            <p>{order.shippingAddress.name}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>
                              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                              {order.shippingAddress.pincode}
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-3">Order Summary</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Subtotal</span>
                              <span>{formatCurrency(order.total / 1.18)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tax (18%)</span>
                              <span>{formatCurrency(order.total - order.total / 1.18)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shipping</span>
                              <span>Free</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold">
                              <span>Total</span>
                              <span>{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {order.trackingNumber && (
                    <Button variant="outline" size="sm">
                      <Truck className="h-4 w-4 mr-2" />
                      Track Package
                    </Button>
                  )}

                  {order.status === "delivered" && (
                    <Button variant="outline" size="sm">
                      Leave Review
                    </Button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
