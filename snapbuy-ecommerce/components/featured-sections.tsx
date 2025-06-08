"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePromotions, type FeaturedSection } from "@/hooks/use-promotions"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function FeaturedSections() {
  const { featuredSections, fetchFeaturedSections } = usePromotions()

  useEffect(() => {
    fetchFeaturedSections()
  }, [fetchFeaturedSections])

  if (featuredSections.length === 0) {
    return (
      <div className="space-y-8">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {featuredSections
        .filter((section) => section.isActive)
        .map((section) => (
          <FeaturedSectionRenderer key={section.id} section={section} />
        ))}
    </div>
  )
}

function FeaturedSectionRenderer({ section }: { section: FeaturedSection }) {
  switch (section.type) {
    case "categories":
      return <CategorySection section={section} />
    case "brands":
      return <BrandSection section={section} />
    case "products":
    default:
      return <ProductSection section={section} />
  }
}

function SectionHeader({ title, subtitle, viewAllLink }: { title: string; subtitle?: string; viewAllLink?: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      {viewAllLink && (
        <Button variant="ghost" size="sm" asChild>
          <Link href={viewAllLink} className="flex items-center gap-1">
            View All <ChevronRight size={16} />
          </Link>
        </Button>
      )}
    </div>
  )
}

function CategorySection({ section }: { section: FeaturedSection }) {
  return (
    <section>
      <SectionHeader title={section.title} subtitle={section.subtitle} viewAllLink="/categories" />
      <div
        className={cn(
          "grid gap-6",
          section.layout === "grid" ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-2",
        )}
      >
        {section.items.map((category) => (
          <Link key={category.id} href={`/products?category=${category.name.toLowerCase()}`}>
            <Card className="overflow-hidden h-full transition-all hover:shadow-md">
              <div className="relative aspect-square">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    <p className="text-sm text-white/80">{category.count} products</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

function BrandSection({ section }: { section: FeaturedSection }) {
  return (
    <section>
      <SectionHeader title={section.title} subtitle={section.subtitle} viewAllLink="/brands" />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {section.items.map((brand) => (
          <Link key={brand.id} href={`/products?brand=${brand.name.toLowerCase()}`}>
            <Card className="h-full transition-all hover:shadow-md">
              <CardContent className="flex items-center justify-center p-6 h-full">
                <div className="relative h-12 w-full">
                  <Image src={brand.logo || "/placeholder.svg"} alt={brand.name} fill className="object-contain" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ProductSection({ section }: { section: FeaturedSection }) {
  return (
    <section>
      <SectionHeader
        title={section.title}
        subtitle={section.subtitle}
        viewAllLink={`/products?section=${section.title.toLowerCase().replace(/\s+/g, "-")}`}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {section.items.length > 0
          ? section.items.map((product) => (
              <Card key={product.id} className="overflow-hidden transition-all hover:shadow-md">
                <div className="relative aspect-square">
                  <Image
                    src={product.image || "/placeholder.svg?height=300&width=300"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{product.brand}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold">${product.price.toFixed(2)}</p>
                    {product.originalPrice && (
                      <p className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          : // Placeholder for when no products are available
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    Coming Soon
                  </div>
                </div>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-4" />
                  <Skeleton className="h-6 w-1/3" />
                </CardContent>
              </Card>
            ))}
      </div>
    </section>
  )
}
