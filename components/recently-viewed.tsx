"use client"

import { useRecentlyViewed } from "@/hooks/use-recently-viewed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Clock, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

export default function RecentlyViewed() {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed()

  if (recentlyViewed.length === 0) {
    return null
  }

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Recently Viewed</span>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={clearRecentlyViewed}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recentlyViewed.slice(0, 6).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/product/${item.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-2">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="font-medium text-sm line-clamp-2 mb-1">{item.name}</h4>
                  <p className="text-xs text-muted-foreground mb-1">{item.brand}</p>
                  <p className="font-bold text-sm">{formatCurrency(item.price)}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
