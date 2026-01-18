"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getAllDishes, getAllReviews, getUserById, getDishById } from "./data";
import RestaurantCard from "./components/RestaurantCard";
import BusinessSearch from "./components/BusinessSearch";
import Navigation from "./components/Navigation";
import { Dish } from "./types";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Eagle Mountain non-chain restaurants (locally owned/independent)
const eagleMountainRestaurants = [
  { name: "Taqueria 27", location: "Eagle Mountain, UT" },
  { name: "Ramen Hero", location: "Eagle Mountain, UT" },
  { name: "SOMTUM: Thai & Lao Food", location: "Eagle Mountain, UT" },
  { name: "Asian Cafe", location: "Eagle Mountain, UT" },
  { name: "No.1 Asian Cuisine", location: "Eagle Mountain, UT" },
  { name: "Village Pizza", location: "Eagle Mountain, UT" },
  { name: "Jurassic Street Tacos", location: "Eagle Mountain, UT" },
];

// Helper function to count reviews for a restaurant
async function getReviewCountForRestaurant(restaurantName: string): Promise<number> {
  const allReviews = await getAllReviews();
  const allDishes = await getAllDishes();
  const dishMap = new Map(allDishes.map(d => [d.id, d]));
  return allReviews.filter((review) => {
    const dish = dishMap.get(review.dishId);
    return dish && dish.restaurant === restaurantName;
  }).length;
}

export default function Home() {
  const router = useRouter();
  const { user: clerkUser, isSignedIn } = useUser();
  const [selectedRestaurant, setSelectedRestaurant] = useState<{
    name: string;
    location: string;
  } | null>(null);
  const [tempDish, setTempDish] = useState<Partial<Dish> | null>(null);
  const [restaurantReviewCounts, setRestaurantReviewCounts] = useState<Map<string, number>>(new Map());
  
  // Load review counts for restaurants
  useEffect(() => {
    async function loadReviewCounts() {
      const counts = new Map<string, number>();
      for (const restaurant of eagleMountainRestaurants) {
        const count = await getReviewCountForRestaurant(restaurant.name);
        counts.set(restaurant.name, count);
      }
      setRestaurantReviewCounts(counts);
    }
    loadReviewCounts();
  }, []);

  const handleRestaurantSelect = (restaurant: { name: string; location: string }) => {
    setSelectedRestaurant(restaurant);
    // Create a temporary dish object with the restaurant info
    setTempDish({
      restaurant: restaurant.name,
      location: restaurant.location,
    });
  };

  const handleCreateDishFromRestaurant = async () => {
    if (!selectedRestaurant || !tempDish?.name || !tempDish?.category) return;
    
    try {
      const { addDish } = await import("./data");
      const newDish = await addDish(
        tempDish.name!,
        selectedRestaurant.name,
        tempDish.category!,
        selectedRestaurant.location
      );
      
      // Navigate to the new dish page
      router.push(`/dish/${encodeURIComponent(newDish.id)}`);
      setTempDish(null);
      setSelectedRestaurant(null);
    } catch (error) {
      console.error("Error creating dish:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Entreete Definition Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-zinc-900 mb-3">
            Entreete
          </h1>
          <p className="text-lg text-zinc-600 mb-2 font-medium">
            /änˈtrā-rāt/
          </p>
          <p className="text-sm text-zinc-500 mb-4 italic">
            "Entree Rate"
          </p>
          <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-lg shadow-sm">
            <p className="text-base text-zinc-700 leading-relaxed">
              A specialized platform designed for the local eats enthusiast to channel their inner foodie by documenting and scoring individual dishes.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-zinc-900 mb-2">
          Eagle Mountain Restaurants
        </h2>
        <p className="text-zinc-600 mb-6">
          Select a restaurant to view and review dishes
        </p>

        {/* Restaurant Search Section */}
        {GOOGLE_MAPS_API_KEY && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              Find a Restaurant
            </h2>
            <BusinessSearch onSelect={handleRestaurantSelect} apiKey={GOOGLE_MAPS_API_KEY} />
            
            {selectedRestaurant && (
              <div className="mt-4 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                  Add a dish from {selectedRestaurant.name}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Dish Name *
                    </label>
                    <input
                      type="text"
                      value={tempDish?.name || ""}
                      onChange={(e) => setTempDish({ ...tempDish, name: e.target.value })}
                      placeholder="e.g., Margherita Pizza"
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={tempDish?.category || ""}
                      onChange={(e) => setTempDish({ ...tempDish, category: e.target.value as Dish["category"] })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                    >
                      <option value="">Select a category</option>
                      <option value="Main Dish">Main Dish</option>
                      <option value="Appetizer">Appetizer</option>
                      <option value="Beverage">Beverage</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <button
                    onClick={handleCreateDishFromRestaurant}
                    disabled={!tempDish?.name || !tempDish?.category}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Add Dish & Review
                  </button>
                </div>
              </div>
            )}
        </div>
        )}

        {/* Restaurant Grid */}
        <div 
          className="grid gap-6 mb-8"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))"
          }}
        >
          {eagleMountainRestaurants.map((restaurant, index) => (
            <RestaurantCard
              key={`restaurant-${index}`}
              name={restaurant.name}
              location={restaurant.location}
              reviewCount={restaurantReviewCounts.get(restaurant.name) || 0}
              onClick={() => {
                // Navigate to restaurant detail page
                router.push(`/restaurant/${encodeURIComponent(restaurant.name)}`);
              }}
            />
          ))}
        </div>

      </div>
      <Navigation />
    </div>
  );
}
