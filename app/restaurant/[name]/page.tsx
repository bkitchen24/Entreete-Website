"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAllDishes, getReviewsByDishId } from "../../data";
import DishCard from "../../components/DishCard";
import AddDishForm from "../../components/AddDishForm";
import Navigation from "../../components/Navigation";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Dish } from "../../types";

// Component to load review count for each dish
function DishCardWithReviews({ dish, onSelect }: { dish: Dish; onSelect: (dish: Dish) => void }) {
  const [reviewCount, setReviewCount] = useState(0);
  
  useEffect(() => {
    async function loadReviewCount() {
      const reviews = await getReviewsByDishId(dish.id);
      setReviewCount(reviews.length);
    }
    loadReviewCount();
  }, [dish.id]);
  
  return (
    <DishCard
      dish={dish}
      reviewCount={reviewCount}
      onSelect={onSelect}
    />
  );
}

export default function RestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const nameParam = params.name;
  const restaurantName = nameParam 
    ? decodeURIComponent(Array.isArray(nameParam) ? nameParam[0] : nameParam)
    : "";
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [restaurantDishes, setRestaurantDishes] = useState<any[]>([]);
  
  // Function to load fresh dishes
  const loadDishes = async () => {
    const allDishes = await getAllDishes();
    return allDishes.filter((dish) => dish.restaurant === restaurantName);
  };

  // Load dishes when component mounts or restaurant name changes
  useEffect(() => {
    async function fetchDishes() {
      const dishes = await loadDishes();
      setRestaurantDishes(dishes);
    }
    fetchDishes();
  }, [restaurantName]);
  
  if (!restaurantName) {
    return (
      <div className="min-h-screen bg-gray-100 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Restaurants</span>
          </Link>
          <p className="text-zinc-500">Restaurant not found</p>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Restaurants</span>
        </Link>

        {/* Restaurant Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-4">
            {restaurantName}
          </h1>
          
          {/* Add Menu Item Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Menu Item
            </button>
          )}
        </div>

        {/* Add Dish Form */}
        {showAddForm && (
          <div className="mb-8">
            <AddDishForm
              restaurantName={restaurantName}
              restaurantLocation="Eagle Mountain, UT"
              onDishAdded={async () => {
                setShowAddForm(false);
                // Refresh dishes list
                const dishes = await loadDishes();
                setRestaurantDishes(dishes);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Menu Items Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">
            Menu Items
          </h2>
          
          {restaurantDishes.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-zinc-500 mb-4">
                No menu items yet. Be the first to add one!
              </p>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add First Menu Item
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {restaurantDishes.map((dish) => (
                <DishCardWithReviews
                  key={dish.id}
                  dish={dish}
                  onSelect={(dish) => {
                    router.push(`/dish/${encodeURIComponent(dish.id)}`);
                  }}
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
