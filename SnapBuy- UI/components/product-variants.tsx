"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface Variant {
  id: number
  type: string
  name: string
  value: string
  priceModifier?: number
  available: boolean
}

interface ProductVariantsProps {
  variants: Variant[]
  selectedVariants: Record<string, Variant>
  onVariantChange: (variants: Record<string, Variant>) => void
}

export default function ProductVariants({ variants, selectedVariants, onVariantChange }: ProductVariantsProps) {
  // Group variants by type
  const variantGroups = variants.reduce(
    (groups, variant) => {
      if (!groups[variant.type]) {
        groups[variant.type] = []
      }
      groups[variant.type].push(variant)
      return groups
    },
    {} as Record<string, Variant[]>,
  )

  const handleVariantSelect = (variant: Variant) => {
    if (!variant.available) return

    const newSelectedVariants = {
      ...selectedVariants,
      [variant.type]: variant,
    }
    onVariantChange(newSelectedVariants)
  }

  const formatVariantType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <div className="space-y-6 mb-6">
      {Object.entries(variantGroups).map(([type, typeVariants]) => (
        <div key={type}>
          <Label className="text-base font-medium mb-3 block">
            {formatVariantType(type)}
            {selectedVariants[type]?.priceModifier && (
              <span className="text-sm text-muted-foreground ml-2">
                (+₹{selectedVariants[type].priceModifier.toLocaleString()})
              </span>
            )}
          </Label>

          {type === "color" ? (
            <div className="flex flex-wrap gap-2">
              {typeVariants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => handleVariantSelect(variant)}
                  disabled={!variant.available}
                  className={`
                    relative w-10 h-10 rounded-full border-2 transition-all
                    ${
                      selectedVariants[type]?.id === variant.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-gray-300"
                    }
                    ${!variant.available ? "opacity-50 cursor-not-allowed" : "hover:border-primary"}
                  `}
                  style={{ backgroundColor: variant.value }}
                  title={variant.name}
                >
                  {!variant.available && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-0.5 bg-red-500 rotate-45"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {typeVariants.map((variant) => (
                <Button
                  key={variant.id}
                  variant={selectedVariants[type]?.id === variant.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleVariantSelect(variant)}
                  disabled={!variant.available}
                  className="min-w-[60px]"
                >
                  {variant.name}
                  {variant.priceModifier && variant.priceModifier > 0 && (
                    <span className="ml-1 text-xs">(+₹{variant.priceModifier.toLocaleString()})</span>
                  )}
                </Button>
              ))}
            </div>
          )}

          {selectedVariants[type] && (
            <p className="text-sm text-muted-foreground mt-2">Selected: {selectedVariants[type].name}</p>
          )}
        </div>
      ))}
    </div>
  )
}
