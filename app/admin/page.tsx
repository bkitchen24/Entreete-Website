"use client";

import { useState, useEffect } from "react";
import { getAllUsers, getAllDishes, getAllReviews } from "../data";
import { User, Dish, Review } from "../types";
import Navigation from "../components/Navigation";
import { Users, UtensilsCrossed, MessageSquare } from "lucide-react";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [usersData, dishesData, reviewsData] = await Promise.all([
          getAllUsers(),
          getAllDishes(),
          getAllReviews(),
        ]);
        setUsers(usersData);
        setDishes(dishesData);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-zinc-600">Loading statistics...</p>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-zinc-900 mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-zinc-600" />
              <h2 className="text-lg font-semibold text-zinc-900">Total Users</h2>
            </div>
            <p className="text-3xl font-bold text-zinc-900">{users.length}</p>
            <p className="text-sm text-zinc-500 mt-1">Logged in users</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <UtensilsCrossed className="w-6 h-6 text-zinc-600" />
              <h2 className="text-lg font-semibold text-zinc-900">Total Dishes</h2>
            </div>
            <p className="text-3xl font-bold text-zinc-900">{dishes.length}</p>
            <p className="text-sm text-zinc-500 mt-1">Menu items added</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-6 h-6 text-zinc-600" />
              <h2 className="text-lg font-semibold text-zinc-900">Total Reviews</h2>
            </div>
            <p className="text-3xl font-bold text-zinc-900">{reviews.length}</p>
            <p className="text-sm text-zinc-500 mt-1">Reviews submitted</p>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">All Users</h2>
          {users.length === 0 ? (
            <p className="text-zinc-500">No users yet.</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 border border-zinc-200 rounded-lg"
                >
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-zinc-900">{user.name}</p>
                    <p className="text-sm text-zinc-500">{user.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-zinc-900">
                      Variety Score: {user.varietyScore}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {user.reviewedCategories.length} categories
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Navigation />
    </div>
  );
}
