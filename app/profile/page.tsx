"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/nextjs";
import { getUserById, getReviewsByUserId, getDishById, getOrCreateUserFromClerkId, deleteReview } from "../data";
import UserProfile from "../components/UserProfile";
import ReviewCard from "../components/ReviewCard";
import Navigation from "../components/Navigation";
import { Review, Dish, User } from "../types";
import { LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user: clerkUser, isSignedIn } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [userReviews, setUserReviews] = useState<(Review & { dish: Dish })[]>([]);

  useEffect(() => {
    async function loadUserData() {
      if (!isSignedIn || !clerkUser) {
        setUser(null);
        setUserReviews([]);
        return;
      }

      // Get or create user from Clerk
      const appUser = await getOrCreateUserFromClerkId(
        clerkUser.id,
        clerkUser.fullName || clerkUser.firstName || undefined,
        clerkUser.imageUrl
      );
      setUser(appUser);

      const reviews = await getReviewsByUserId(appUser.id);
      const enrichedReviews: (Review & { dish: Dish })[] = [];
      for (const review of reviews) {
        const dish = await getDishById(review.dishId);
        if (dish) {
          enrichedReviews.push({ ...review, dish });
        }
      }
      setUserReviews(enrichedReviews);
    }
    loadUserData();
  }, [isSignedIn, clerkUser]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!isSignedIn || !clerkUser) return;

    try {
      await deleteReview(reviewId, clerkUser.id);
      // Refresh reviews
      const reviews = await getReviewsByUserId(clerkUser.id);
      const enrichedReviews: (Review & { dish: Dish })[] = [];
      for (const review of reviews) {
        const dish = await getDishById(review.dishId);
        if (dish) {
          enrichedReviews.push({ ...review, dish });
        }
      }
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
        <div className="flex items-center justify-between mb-6">
          <UserProfile user={user} />
          <SignOutButton>
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </SignOutButton>
        </div>

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
