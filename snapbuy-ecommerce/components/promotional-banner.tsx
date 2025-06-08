"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Copy, Check, Settings, RefreshCw, AlertCircle } from "lucide-react"
import { usePromotions } from "@/hooks/use-promotions"
import { useBannerSettings, type TransitionType } from "@/hooks/use-banner-settings"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Animation variants for different transition types
const getAnimationVariants = (type: TransitionType, duration: number) => {
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration },
    },
    slide: {
      initial: { x: 300, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -300, opacity: 0 },
      transition: { duration, ease: "easeInOut" },
    },
    zoom: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 1.2, opacity: 0 },
      transition: { duration, ease: "easeOut" },
    },
    flip: {
      initial: { rotateY: 90, opacity: 0 },
      animate: { rotateY: 0, opacity: 1 },
      exit: { rotateY: -90, opacity: 0 },
      transition: { duration, ease: "easeInOut" },
    },
    none: {
      initial: {},
      animate: {},
      exit: {},
      transition: { duration: 0 },
    },
  }

  return variants[type]
}

export default function PromotionalBanner() {
  const {
    banners,
    isLoading,
    error,
    currentBannerIndex,
    fetchPromotions,
    refreshPromotions,
    nextBanner,
    previousBanner,
    setCurrentBanner,
  } = usePromotions()

  const {
    autoRotationSpeed,
    transitionType,
    transitionDuration,
    pauseOnHover,
    showArrows,
    showDots,
    enableAutoRotation,
    updateSettings,
  } = useBannerSettings()

  const [autoplay, setAutoplay] = useState(enableAutoRotation)
  const [copied, setCopied] = useState<number | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchPromotions()
  }, [fetchPromotions])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (autoplay && enableAutoRotation && banners.length > 0) {
      interval = setInterval(() => {
        nextBanner()
      }, autoRotationSpeed)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoplay, enableAutoRotation, autoRotationSpeed, banners.length, nextBanner])

  const copyPromoCode = (code: string, id: number) => {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setAutoplay(false)
    }
  }

  const handleMouseLeave = () => {
    if (enableAutoRotation) {
      setAutoplay(true)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshPromotions()
    setIsRefreshing(false)
  }

  if (isLoading && banners.length === 0) {
    return (
      <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading promotional banners...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && banners.length === 0) {
    return (
      <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
        <Alert className="h-full flex items-center justify-center">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            Failed to load promotional banners.
            <Button variant="link" className="p-0 ml-1 h-auto" onClick={handleRefresh}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-full h-[200px] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No promotional banners available</p>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  const currentBanner = banners[currentBannerIndex]
  const animationVariants = getAnimationVariants(transitionType, transitionDuration)

  return (
    <div
      className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={animationVariants.initial}
          animate={animationVariants.animate}
          exit={animationVariants.exit}
          transition={animationVariants.transition}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <Image
            src={currentBanner.backgroundImage || "/placeholder.svg?height=500&width=1200"}
            alt={currentBanner.title}
            fill
            priority
            className="object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=500&width=1200"
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

          {/* Brand Logo (Top Left) */}
          {currentBanner.brandLogo && (
            <div className="absolute top-4 left-4 bg-white p-2 rounded-md h-12 w-12 flex items-center justify-center">
              <Image
                src={currentBanner.brandLogo || "/placeholder.svg"}
                alt="Brand Logo"
                width={40}
                height={40}
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16 text-white">
            <div className="max-w-xl">
              {/* Category */}
              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-2xl md:text-3xl font-medium mb-2"
              >
                {currentBanner.category}
              </motion.h3>

              {/* Main Discount Text */}
              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-4xl md:text-6xl font-bold mb-2"
              >
                {currentBanner.discountText}
              </motion.h2>

              {/* Subtitle */}
              {currentBanner.subtitle && (
                <motion.h3
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-xl md:text-2xl font-medium mb-4"
                >
                  {currentBanner.subtitle}
                </motion.h3>
              )}

              {/* Promo Code */}
              {currentBanner.promoCode && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex items-center mt-4 mb-6"
                >
                  <p className="text-sm mr-2">Use code:</p>
                  <div className="relative flex items-center bg-white/20 backdrop-blur-sm rounded-md px-3 py-1.5 border border-white/30">
                    <span className="text-white font-semibold mr-2">{currentBanner.promoCode}</span>
                    <button
                      onClick={() => copyPromoCode(currentBanner.promoCode!, currentBanner.id)}
                      className="text-white hover:text-white/80 transition-colors"
                      aria-label="Copy promo code"
                    >
                      {copied === currentBanner.id ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* CTA Button */}
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Button asChild className="mt-4" size="lg">
                  <Link href={currentBanner.ctaLink}>{currentBanner.ctaText}</Link>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Partner Logos (Bottom) */}
          {currentBanner.partnerLogos && currentBanner.partnerLogos.length > 0 && (
            <div className="absolute bottom-4 left-8 flex items-center gap-4">
              {currentBanner.partnerLogos.map((logo, index) => (
                <div key={index} className="bg-white p-1 rounded-md h-8 w-auto flex items-center justify-center">
                  <Image
                    src={logo || "/placeholder.svg"}
                    alt={`Partner ${index + 1}`}
                    width={80}
                    height={24}
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* T&C Text */}
          <div className="absolute bottom-4 right-8">
            <p className="text-xs text-white/80">*T&C apply</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Refresh Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-16 bg-black/30 hover:bg-black/50 text-white border-none"
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
      </Button>

      {/* Navigation Arrows */}
      {showArrows && banners.length > 1 && (
        <>
          <button
            onClick={previousBanner}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
            aria-label="Previous banner"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
            aria-label="Next banner"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {showDots && banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentBannerIndex === index ? "bg-white w-4" : "bg-white/50 hover:bg-white/80",
              )}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Settings Button */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white border-none"
          >
            <Settings size={16} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Banner Settings</DialogTitle>
            <DialogDescription>Customize the banner rotation speed and transition effects.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="autoRotation" className="col-span-2">
                Auto Rotation
              </Label>
              <div className="col-span-2 flex items-center justify-end">
                <Switch
                  id="autoRotation"
                  checked={enableAutoRotation}
                  onCheckedChange={(checked) => {
                    updateSettings({ enableAutoRotation: checked })
                    setAutoplay(checked)
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rotationSpeed" className="col-span-2">
                Rotation Speed (seconds)
              </Label>
              <div className="col-span-2">
                <Slider
                  id="rotationSpeed"
                  disabled={!enableAutoRotation}
                  min={1000}
                  max={10000}
                  step={500}
                  value={[autoRotationSpeed]}
                  onValueChange={(value) => updateSettings({ autoRotationSpeed: value[0] })}
                  className="w-full"
                />
                <div className="text-right text-sm text-muted-foreground mt-1">{autoRotationSpeed / 1000}s</div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transitionType" className="col-span-2">
                Transition Effect
              </Label>
              <Select
                value={transitionType}
                onValueChange={(value: TransitionType) => updateSettings({ transitionType: value })}
              >
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Select transition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="flip">Flip</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transitionDuration" className="col-span-2">
                Transition Duration (seconds)
              </Label>
              <div className="col-span-2">
                <Slider
                  id="transitionDuration"
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  value={[transitionDuration]}
                  onValueChange={(value) => updateSettings({ transitionDuration: value[0] })}
                  className="w-full"
                  disabled={transitionType === "none"}
                />
                <div className="text-right text-sm text-muted-foreground mt-1">{transitionDuration.toFixed(1)}s</div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pauseOnHover" className="col-span-2">
                Pause on Hover
              </Label>
              <div className="col-span-2 flex items-center justify-end">
                <Switch
                  id="pauseOnHover"
                  checked={pauseOnHover}
                  onCheckedChange={(checked) => updateSettings({ pauseOnHover: checked })}
                  disabled={!enableAutoRotation}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="showArrows" className="col-span-2">
                Show Navigation Arrows
              </Label>
              <div className="col-span-2 flex items-center justify-end">
                <Switch
                  id="showArrows"
                  checked={showArrows}
                  onCheckedChange={(checked) => updateSettings({ showArrows: checked })}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="showDots" className="col-span-2">
                Show Pagination Dots
              </Label>
              <div className="col-span-2 flex items-center justify-end">
                <Switch
                  id="showDots"
                  checked={showDots}
                  onCheckedChange={(checked) => updateSettings({ showDots: checked })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => useBannerSettings.getState().resetSettings()}>
              Reset to Defaults
            </Button>
            <Button onClick={() => setIsSettingsOpen(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
