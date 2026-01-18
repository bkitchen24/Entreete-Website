"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserById, getReviewsByUserId, getDishById, getOrCreateUserFromClerkId, deleteReview } from "../data";
import UserProfile from "../components/UserProfile";
import ReviewCard from "../components/ReviewCard";
import Navigation from "../components/Navigation";
import { Review } from "../types";

export default function ProfilePage() {
  const { user: clerkUser, isSignedIn } = useUser();
  const [user, setUser] = useState<ReturnType<typeof getUserById>>(null);
  const [userReviews, setUserReviews] = useState<(Review & { dish: ReturnType<typeof getDishById> })[]>([]);

  useEffect(() => {
    if (!isSignedIn || !clerkUser) {
      setUser(null);
      setUserReviews([]);
      return;
    }

    // Get or create user from Clerk
    const appUser = getOrCreateUserFromClerkId(
      clerkUser.id,
      clerkUser.fullName || clerkUser.firstName || undefined,
      clerkUser.imageUrl
    );
    setUser(appUser);

    const reviews = getReviewsByUserId(appUser.id);
    const enrichedReviews = reviews
      .map((review) => {
        const dish = getDishById(review.dishId);
        if (dish) {
          return { ...review, dish };
        }
        return null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    setUserReviews(enrichedReviews);
  }, [isSignedIn, clerkUser]);

  const handleDeleteReview = (reviewId: string) => {
    if (!isSignedIn || !clerkUser) return;

    try {
      deleteReview(reviewId, clerkUser.id);
      // Refresh reviews
      const reviews = getReviewsByUserId(clerkUser.id);
      const enrichedReviews = reviews
        .map((review) => {
          const dish = getDishById(review.dishId);
          if (dish) {
            return { ...review, dish };
          }
          return null;
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);
      setUserReviews(enrichedReviews);
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(error instanceof Error ? error.message : "Failed to delete review");
    }
  };

  if (!isSignedIn || !clerkUser) {
    return (
      <div className="min-h-screen bg-gray-100 pb-20">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <p className="text-zinc-500">Please sign in to view your profile</p>
        </div>
        <Navigation />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 pb-20">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <p className="text-zinc-500">Loading profile...</p>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <UserProfile user={user} />

        <div className="mt-8">
          <h2 className="text-xl font-bold text-zinc-900 mb-4">
            My Reviews
          </h2>
          {userReviews.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-zinc-500">
                You haven't reviewed any dishes yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  dish={review.dish}
                  user={user}
                  currentUserId={clerkUser?.id}
                  onDelete={handleDeleteReview}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Navigation />
    </div>
  );
}
