import { Dish, Review, User, FoodCategory } from "./types";

// API-based data functions (replaces localStorage)
const API_BASE = typeof window !== "undefined" ? window.location.origin : "";

// Helper to convert database format to app format
function dbDishToDish(dbDish: any): Dish {
  return {
    id: dbDish.id,
    name: dbDish.name,
    restaurant: dbDish.restaurant,
    location: dbDish.location,
    category: dbDish.category,
    description: dbDish.description,
  };
}

function dbReviewToReview(dbReview: any): Review {
  return {
    id: dbReview.id,
    dishId: dbReview.dish_id,
    userId: dbReview.user_id,
    rating: dbReview.rating,
    comment: dbReview.comment,
    imageUrl: dbReview.image_url,
    createdAt: new Date(dbReview.created_at),
  };
}

function dbUserToUser(dbUser: any): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    username: dbUser.username,
    avatar: dbUser.avatar,
    following: dbUser.following || [],
    reviewedCategories: dbUser.reviewed_categories || [],
    varietyScore: dbUser.variety_score || 0,
  };
}

// Helper functions
export async function getDishById(id: string): Promise<Dish | undefined> {
  try {
    const response = await fetch(`${API_BASE}/api/dishes`);
    const dishes = await response.json();
    const dish = dishes.find((d: any) => d.id === id);
    return dish ? dbDishToDish(dish) : undefined;
  } catch (error) {
    console.error("Error fetching dish:", error);
    return undefined;
  }
}

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    const response = await fetch(`${API_BASE}/api/users?id=${id}`);
    const user = await response.json();
    return user ? dbUserToUser(user) : undefined;
  } catch (error) {
    console.error("Error fetching user:", error);
    return undefined;
  }
}

export async function getReviewsByDishId(dishId: string): Promise<Review[]> {
  try {
    const response = await fetch(`${API_BASE}/api/reviews?dishId=${dishId}`);
    const reviews = await response.json();
    return reviews.map(dbReviewToReview);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export async function getReviewsByUserId(userId: string): Promise<Review[]> {
  try {
    const response = await fetch(`${API_BASE}/api/reviews?userId=${userId}`);
    const reviews = await response.json();
    return reviews.map(dbReviewToReview);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export function calculateVarietyScore(reviewedCategories: FoodCategory[]): number {
  return reviewedCategories.length;
}

// Helper function to get or create user from Clerk ID
export async function getOrCreateUserFromClerkId(
  clerkUserId: string,
  clerkUserName?: string,
  clerkUserImageUrl?: string
): Promise<User> {
  try {
    // Try to get existing user
    let user = await getUserById(clerkUserId);

    if (!user) {
      // Create new user
      const newUser = {
        id: clerkUserId,
        name: clerkUserName || "User",
        username: `@${clerkUserId.slice(0, 8)}`,
        avatar: clerkUserImageUrl,
        following: [],
        reviewed_categories: [],
        variety_score: 0,
      };

      const response = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const dbUser = await response.json();
      user = dbUserToUser(dbUser);
    } else {
      // Update existing user
      if (clerkUserName) user.name = clerkUserName;
      if (clerkUserImageUrl) user.avatar = clerkUserImageUrl;

      const response = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          following: user.following,
          reviewed_categories: user.reviewedCategories,
          variety_score: user.varietyScore,
        }),
      });

      const dbUser = await response.json();
      user = dbUserToUser(dbUser);
    }

    return user;
  } catch (error) {
    console.error("Error getting/creating user:", error);
    // Return a fallback user
    return {
      id: clerkUserId,
      name: clerkUserName || "User",
      username: `@${clerkUserId.slice(0, 8)}`,
      avatar: clerkUserImageUrl,
      following: [],
      reviewedCategories: [],
      varietyScore: 0,
    };
  }
}

export async function addReview(
  dishId: string,
  userId: string,
  rating: number,
  comment?: string,
  imageUrl?: string
): Promise<Review> {
  try {
    const dish = await getDishById(dishId);
    if (!dish) throw new Error("Dish not found");

    const user = await getUserById(userId);
    if (!user) throw new Error("User not found");

    // Check if this is a new category for the user
    const isNewCategory = !user.reviewedCategories.includes(dish.category);

    if (isNewCategory) {
      user.reviewedCategories.push(dish.category);
      user.varietyScore = calculateVarietyScore(user.reviewedCategories);

      // Update user
      await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          following: user.following,
          reviewed_categories: user.reviewedCategories,
          variety_score: user.varietyScore,
        }),
      });
    }

    const newReview = {
      id: `r${Date.now()}`,
      dish_id: dishId,
      user_id: userId,
      rating,
      comment,
      image_url: imageUrl,
    };

    const response = await fetch(`${API_BASE}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
    });

    const dbReview = await response.json();
    return dbReviewToReview(dbReview);
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
}

export async function deleteReview(reviewId: string, userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/reviews?id=${reviewId}&userId=${userId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete review");
    }

    // Update user's variety score if needed
    const user = await getUserById(userId);
    if (user) {
      // Get all user's reviews to recalculate variety score
      const userReviews = await getReviewsByUserId(userId);
      const dishes = await Promise.all(
        userReviews.map((r) => getDishById(r.dishId))
      );
      const categories = new Set(
        dishes.filter((d): d is Dish => d !== undefined).map((d) => d.category)
      );
      user.reviewedCategories = Array.from(categories);
      user.varietyScore = calculateVarietyScore(user.reviewedCategories);

      await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          following: user.following,
          reviewed_categories: user.reviewedCategories,
          variety_score: user.varietyScore,
        }),
      });
    }

    return true;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
}

export async function addDish(
  name: string,
  restaurant: string,
  category: FoodCategory,
  location?: string
): Promise<Dish> {
  try {
    const newDish = {
      id: `dish-${Date.now()}`,
      name,
      restaurant,
      category,
      location,
    };

    const response = await fetch(`${API_BASE}/api/dishes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDish),
    });

    const dbDish = await response.json();
    return dbDishToDish(dbDish);
  } catch (error) {
    console.error("Error adding dish:", error);
    throw error;
  }
}

// Get all dishes (for restaurant page)
export async function getAllDishes(): Promise<Dish[]> {
  try {
    const response = await fetch(`${API_BASE}/api/dishes`);
    const dishes = await response.json();
    return dishes.map(dbDishToDish);
  } catch (error) {
    console.error("Error fetching dishes:", error);
    return [];
  }
}

// Get all reviews (for discovery page)
export async function getAllReviews(): Promise<Review[]> {
  try {
    const response = await fetch(`${API_BASE}/api/reviews`);
    const reviews = await response.json();
    return reviews.map(dbReviewToReview);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}
