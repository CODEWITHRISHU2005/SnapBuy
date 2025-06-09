"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="relative w-16 h-16"
        >
          <Image src="/images/snapbuy-logo.jpeg" alt="Loading..." fill className="rounded-xl object-cover" />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="text-sm text-muted-foreground"
        >
          Loading...
        </motion.p>
      </div>
    </div>
  )
}
