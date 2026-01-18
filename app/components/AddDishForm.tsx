"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { Plus, X, LogIn } from "lucide-react";
import { FoodCategory } from "../types";

interface AddDishFormProps {
  restaurantName: string;
  restaurantLocation: string;
  onDishAdded: () => void;
  onCancel: () => void;
}

export default function AddDishForm({ restaurantName, restaurantLocation, onDishAdded, onCancel }: AddDishFormProps) {
  const { isSignedIn } = useUser();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<FoodCategory | "">("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !name || !category) return;

    try {
      // Import dynamically to avoid circular dependencies
      const { addDish } = await import("../data");
      await addDish(name, restaurantName, category as FoodCategory, restaurantLocation);
      onDishAdded();
      // Reset form
      setName("");
      setCategory("");
    } catch (error) {
      console.error("Error adding dish:", error);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="bg-white rounded-lg border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-zinc-900">Add Menu Item</h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-zinc-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-zinc-600" />
          </button>
        </div>
        <p className="text-zinc-600 mb-4">
          Sign in to add menu items
        </p>
        <SignInButton mode="modal">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign in to Add Menu Item
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-zinc-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-zinc-900">Add Menu Item to {restaurantName}</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 hover:bg-zinc-100 rounded transition-colors"
        >
          <X className="w-5 h-5 text-zinc-600" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Dish Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Margherita Pizza"
            required
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FoodCategory)}
            required
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <option value="">Select a category</option>
            <option value="Main Dish">Main Dish</option>
            <option value="Appetizer">Appetizer</option>
            <option value="Beverage">Beverage</option>
            <option value="Dessert">Dessert</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg font-medium hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name || !category}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Dish
          </button>
        </div>
      </div>
    </form>
  );
}
