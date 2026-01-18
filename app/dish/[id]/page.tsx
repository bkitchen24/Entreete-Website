"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { getDishById, getReviewsByDishId, getUserById, getOrCreateUserFromClerkId, addReview, deleteReview } from "../../data";
import ReviewForm from "../../components/ReviewForm";
import ReviewCard from "../../components/ReviewCard";
import Navigation from "../../components/Navigation";
import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";

export default function DishPage() {
  const params = useParams();
  const router = useRouter();
  const { user: clerkUser, isSignedIn } = useUser();
  const dishId = params.id as string;
  
  const [dish, setDish] = useState(getDishById(dishId));
  const [reviews, setReviews] = useState(getReviewsByDishId(dishId));
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const currentDish = getDishById(dishId);
    setDish(currentDish);
    if (currentDish) {
      setReviews(getReviewsByDishId(dishId));
    }
  }, [dishId]);

  const handleReviewSubmit = (rating: number, comment: string, imageUrl?: string) => {
    if (!dish || !isSignedIn || !clerkUser) return;

    try {
      const appUser = getOrCreateUserFromClerkId(
        clerkUser.id,
        clerkUser.fullName || clerkUser.firstName || undefined,
        clerkUser.imageUrl
      );
      
      addReview(dish.id, appUser.id, rating, comment, imageUrl);
      setReviews(getReviewsByDishId(dishId));
      setShowReviewForm(false);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    if (!isSignedIn || !clerkUser) return;

    try {
      deleteReview(reviewId, clerkUser.id);
      setReviews(getReviewsByDishId(dishId));
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(error instanceof Error ? error.message : "Failed to delete review");
    }
  };

  if (!dish) {
    return (
      <div className="min-h-screen bg-gray-100 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <p className="text-zinc-500">Dish not found</p>
        </div>
        <Navigation />
      </div>
    );
  }

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Link
          href={`/restaurant/${encodeURIComponent(dish.restaurant)}`}
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {dish.restaurant}</span>
        </Link>

        {/* Dish Header */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-zinc-900 mb-2">
                {dish.name}
              </h1>
              <p className="text-lg text-zinc-600 mb-1">
                {dish.restaurant}
              </p>
              {dish.location && (
                <p className="text-sm text-zinc-500 mb-3">
                  {dish.location}
                </p>
              )}
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-zinc-100 text-zinc-700">
                  {dish.category}
                </span>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-zinc-900">
                      {averageRating.toFixed(1)}/10
                    </span>
                    <span className="text-sm text-zinc-500">
                      ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Review Form */}
        <div className="mb-6">
          {!showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="w-full px-4 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
            >
              {isSignedIn ? "Write a Review" : "Sign in to Review"}
            </button>
          ) : (
            <ReviewForm
              dish={dish}
              userId={clerkUser?.id || ""}
              onSubmit={handleReviewSubmit}
            />
          )}
        </div>

        {/* Reviews Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">
            Reviews ({reviews.length})
          </h2>
          
          {reviews.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-zinc-500">
                No reviews yet. Be the first to review!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const user = getUserById(review.userId);
                if (!user) return null;
                return (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    dish={dish}
                    user={user}
                    currentUserId={clerkUser?.id}
                    onDelete={handleDeleteReview}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Navigation />
    </div>
  );
}
