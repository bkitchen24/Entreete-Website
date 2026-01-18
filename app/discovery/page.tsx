"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { reviews as allReviews, getUserById, getDishById, deleteReview } from "../data";
import ReviewCard from "../components/ReviewCard";
import Navigation from "../components/Navigation";
import { Review, Dish, User } from "../types";

export default function DiscoveryPage() {
  const { user: clerkUser, isSignedIn } = useUser();
  const [feedReviews, setFeedReviews] = useState<(Review & { dish: Dish; user: User })[]>([]);

  useEffect(() => {
    // Get all reviews sorted by most recent
    const sortedReviews = [...allReviews].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    const enrichedReviews: (Review & { dish: Dish; user: User })[] = sortedReviews
      .map((review) => {
        const dish = getDishById(review.dishId);
        let user = getUserById(review.userId);
        // If user not found, create a fallback user object
        if (!user) {
          user = {
            id: review.userId,
            name: "Unknown User",
            username: `@user${review.userId.slice(0, 8)}`,
            following: [],
            reviewedCategories: [],
            varietyScore: 0,
          };
        }
        if (dish) {
          return { ...review, dish, user };
        }
        return null;
      })
      .filter((r): r is Review & { dish: Dish; user: User } => r !== null);
    setFeedReviews(enrichedReviews);
  }, []);

  const handleDeleteReview = (reviewId: string) => {
    if (!isSignedIn || !clerkUser) return;

    try {
      deleteReview(reviewId, clerkUser.id);
      // Refresh feed - get all reviews sorted by most recent
      const sortedReviews = [...allReviews].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      const enrichedReviews: (Review & { dish: Dish; user: User })[] = sortedReviews
        .map((review) => {
          const dish = getDishById(review.dishId);
          let user = getUserById(review.userId);
          // If user not found, create a fallback user object
          if (!user) {
            user = {
              id: review.userId,
              name: "Unknown User",
              username: `@user${review.userId.slice(0, 8)}`,
              following: [],
              reviewedCategories: [],
              varietyScore: 0,
            };
          }
          if (dish) {
            return { ...review, dish, user };
          }
          return null;
        })
        .filter((r): r is Review & { dish: Dish; user: User } => r !== null);
      setFeedReviews(enrichedReviews);
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(error instanceof Error ? error.message : "Failed to delete review");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">
          Discovery Feed
        </h1>
        <p className="text-zinc-600 mb-6">
          Most recent reviews from all users
        </p>

        {feedReviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">
              No reviews yet. Be the first to review a dish!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                dish={review.dish}
                user={review.user}
                currentUserId={clerkUser?.id}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>
        )}
      </div>
      <Navigation />
    </div>
  );
}
