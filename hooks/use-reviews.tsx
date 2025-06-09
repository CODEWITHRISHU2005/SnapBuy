"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Review {
  id: string
  productId: number
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
  helpful: number
}

interface ReviewsStore {
  reviews: Review[]
  addReview: (review: Omit<Review, "id" | "createdAt" | "helpful">) => void
  getProductReviews: (productId: number) => Review[]
  getAverageRating: (productId: number) => number
  markHelpful: (reviewId: string) => void
}

export const useReviews = create<ReviewsStore>()(
  persist(
    (set, get) => ({
      reviews: [
        // Mock reviews
        {
          id: "1",
          productId: 1,
          userId: "user1",
          userName: "John D.",
          rating: 5,
          comment: "Amazing phone! The camera quality is outstanding and battery life is excellent.",
          createdAt: "2024-01-15T10:30:00Z",
          helpful: 12,
        },
        {
          id: "2",
          productId: 1,
          userId: "user2",
          userName: "Sarah M.",
          rating: 4,
          comment: "Great device overall, but a bit pricey. The performance is top-notch though.",
          createdAt: "2024-01-10T14:20:00Z",
          helpful: 8,
        },
        {
          id: "3",
          productId: 6,
          userId: "user3",
          userName: "Mike R.",
          rating: 5,
          comment: "Best smartphone I've ever owned. The display is gorgeous and the camera is incredible.",
          createdAt: "2024-01-12T09:15:00Z",
          helpful: 15,
        },
      ],

      addReview: (review) =>
        set((state) => ({
          reviews: [
            ...state.reviews,
            {
              ...review,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
              helpful: 0,
            },
          ],
        })),

      getProductReviews: (productId) => {
        return get()
          .reviews.filter((review) => review.productId === productId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      },

      getAverageRating: (productId) => {
        const productReviews = get().reviews.filter((review) => review.productId === productId)
        if (productReviews.length === 0) return 0

        const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0)
        return Math.round((totalRating / productReviews.length) * 10) / 10
      },

      markHelpful: (reviewId) =>
        set((state) => ({
          reviews: state.reviews.map((review) =>
            review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review,
          ),
        })),
    }),
    {
      name: "reviews-storage",
    },
  ),
)
