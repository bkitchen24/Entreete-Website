export type FoodCategory = 
  | "Main Dish"
  | "Appetizer"
  | "Beverage"
  | "Dessert"
  | "Other";

export interface Dish {
  id: string;
  name: string;
  restaurant: string;
  location?: string; // Address/location from Google Places
  category: FoodCategory;
  description?: string;
}

export interface Review {
  id: string;
  dishId: string;
  userId: string;
  rating: number; // 1-10 scale
  comment?: string;
  imageUrl?: string; // Base64 or URL of review image
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  following: string[]; // User IDs
  reviewedCategories: FoodCategory[]; // Categories they've reviewed
  varietyScore: number;
}
