"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useReviews } from "@/hooks/use-reviews"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Star, ThumbsUp, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ProductReviewsProps {
  productId: number
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { getProductReviews, getAverageRating, addReview, markHelpful } = useReviews()
  const { user } = useAuth()
  const { toast } = useToast()

  const [isWritingReview, setIsWritingReview] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)

  const reviews = getProductReviews(productId)
  const averageRating = getAverageRating(productId)

  const handleSubmitReview = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to leave a review.",
        variant: "destructive",
      })
      return
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating.",
        variant: "destructive",
      })
      return
    }

    if (comment.trim().length < 10) {
      toast({
        title: "Review too short",
        description: "Please write at least 10 characters.",
        variant: "destructive",
      })
      return
    }

    addReview({
      productId,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName?.charAt(0)}.`,
      rating,
      comment: comment.trim(),
    })

    toast({
      title: "Review submitted",
      description: "Thank you for your review!",
    })

    setRating(0)
    setComment("")
    setIsWritingReview(false)
  }

  const handleMarkHelpful = (reviewId: string) => {
    markHelpful(reviewId)
    toast({
      title: "Thank you!",
      description: "Your feedback helps other customers.",
    })
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const ratingDistribution = getRatingDistribution()

  return (
    <div className="mt-12">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Customer Reviews</span>
              </CardTitle>
              <CardDescription>
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </CardDescription>
            </div>
            <Dialog open={isWritingReview} onOpenChange={setIsWritingReview}>
              <DialogTrigger asChild>
                <Button>Write a Review</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Write a Review</DialogTitle>
                  <DialogDescription>Share your experience with this product</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="p-1"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= (hoveredRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Review</label>
                    <Textarea
                      placeholder="Tell others about your experience with this product..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsWritingReview(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitReview}>Submit Review</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {reviews.length > 0 && (
            <div className="mb-8">
              {/* Rating Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{averageRating}</div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Based on {reviews.length} reviews</p>
                </div>

                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center space-x-2">
                      <span className="text-sm w-8">{stars}</span>
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${
                              reviews.length > 0
                                ? (ratingDistribution[stars as keyof typeof ratingDistribution] / reviews.length) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-8">
                        {ratingDistribution[stars as keyof typeof ratingDistribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b pb-6 last:border-b-0"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{review.userName}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{review.comment}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkHelpful(review.id)}
                      className="text-muted-foreground"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Helpful ({review.helpful})
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {reviews.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to share your experience with this product.</p>
              <Button onClick={() => setIsWritingReview(true)}>Write the First Review</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
