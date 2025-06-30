// This file now serves as fallback data when backend is not available
// The main data now comes from the Spring Boot backend

import { type Product } from "./api"

export const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "iPhone 17 Air",
    brand: "Apple",
    price: 89900,
    image: "/placeholder.svg?height=400&width=400",
    description:
      "The latest iPhone with advanced AI features, a stunning display, and all-day battery life. Experience the power of Apple's newest A18 chip and an improved camera system.",
    rating: 4.8,
    reviews: 245,
    category: "electronics",
    stock: 15,
    variants: [
      { id: 1, type: "color", name: "Space Black", value: "#1a1a1a", available: true },
      { id: 2, type: "color", name: "Silver", value: "#c0c0c0", available: true },
      { id: 3, type: "color", name: "Gold", value: "#ffd700", available: false },
      { id: 4, type: "storage", name: "128GB", value: "128GB", priceModifier: 0, available: true },
      { id: 5, type: "storage", name: "256GB", value: "256GB", priceModifier: 10000, available: true },
      { id: 6, type: "storage", name: "512GB", value: "512GB", priceModifier: 20000, available: true },
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  // Add more fallback products as needed
]

// Export the products array for backward compatibility
export const products = fallbackProducts