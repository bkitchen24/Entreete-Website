import { Dish, Review, User, FoodCategory } from "./types";

// Check if Vercel Postgres is configured (via API routes)
const USE_VERCEL_POSTGRES = typeof window !== "undefined";

const API_BASE = typeof window !== "undefined" ? window.location.origin : "";

// Default mock data
const defaultDishes: Dish[] = [
  { id: "1", name: "Margherita Pizza", restaurant: "Tony's Italian", location: "123 Main St, New York, NY 10001", category: "Main Dish" },
  { id: "2", name: "Pad Thai", restaurant: "Bangkok Express", location: "456 Broadway, New York, NY 10013", category: "Main Dish" },
  { id: "3", name: "Tacos al Pastor", restaurant: "El Mariachi", location: "789 5th Ave, New York, NY 10022", category: "Main Dish" },
  { id: "4", name: "Ramen", restaurant: "Tokyo Ramen", location: "321 Lexington Ave, New York, NY 10016", category: "Main Dish" },
  { id: "5", name: "Kung Pao Chicken", restaurant: "Golden Dragon", location: "654 Park Ave, New York, NY 10021", category: "Main Dish" },
  { id: "6", name: "Butter Chicken", restaurant: "Taj Mahal", location: "987 Madison Ave, New York, NY 10075", category: "Main Dish" },
  { id: "7", name: "Bibimbap", restaurant: "Seoul Kitchen", location: "147 2nd Ave, New York, NY 10003", category: "Main Dish" },
  { id: "8", name: "Pho", restaurant: "Saigon Street", location: "258 3rd Ave, New York, NY 10010", category: "Main Dish" },
];

// localStorage helpers
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      // Convert date strings back to Date objects
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => {
          if (item.createdAt) {
            return { ...item, createdAt: new Date(item.createdAt) };
          }
          return item;
        }) as T;
      }
      return parsed;
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
  }
  return defaultValue;
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// Load data from localStorage or use defaults
export let dishes: Dish[] = getStorageItem<Dish[]>("entreete_dishes", defaultDishes);
export let reviews: Review[] = getStorageItem<Review[]>("entreete_reviews", []);

const defaultUsers: User[] = [
  {
    id: "user1",
    name: "Alex Chen",
    username: "@alexchen",
    following: ["user2", "user3"],
    reviewedCategories: ["Main Dish", "Appetizer"],
    varietyScore: 2,
  },
  {
    id: "user2",
    name: "Sarah Johnson",
    username: "@sarahj",
    following: ["user1", "user3"],
    reviewedCategories: ["Main Dish", "Appetizer", "Beverage", "Dessert"],
    varietyScore: 4,
  },
  {
    id: "user3",
    name: "Mike Rodriguez",
    username: "@miker",
    following: ["user1"],
    reviewedCategories: ["Main Dish", "Appetizer", "Beverage", "Dessert", "Other"],
    varietyScore: 5,
  },
];

export let users: User[] = getStorageItem("entreete_users", defaultUsers);

// Helper function to reload data from localStorage
function reloadDataFromStorage() {
  dishes = getStorageItem<Dish[]>("entreete_dishes", defaultDishes);
  reviews = getStorageItem<Review[]>("entreete_reviews", []);
  users = getStorageItem<User[]>("entreete_users", defaultUsers);
}

// Helper functions
export async function getDishById(id: string): Promise<Dish | undefined> {
  if (USE_VERCEL_POSTGRES) {
    try {
      const response = await fetch(`${API_BASE}/api/dishes?id=${id}`);
      if (!response.ok) return undefined;
      const dbDish = await response.json();
      return {
        id: dbDish.id,
        name: dbDish.name,
        restaurant: dbDish.restaurant,
        location: dbDish.location,
        category: dbDish.category,
        description: dbDish.description,
      };
    } catch (error) {
      console.error("Error fetching dish:", error);
      return undefined;
    }
  }
  // Fallback to localStorage
  const freshDishes = getStorageItem<Dish[]>("entreete_dishes", defaultDishes);
  dishes = freshDishes;
  return freshDishes.find((d) => d.id === id);
}

export async function getUserById(id: string): Promise<User | undefined> {
  if (USE_VERCEL_POSTGRES) {
    try {
      const response = await fetch(`${API_BASE}/api/users?id=${id}`);
      if (!response.ok) return undefined;
      const dbUser = await response.json();
      return {
        id: dbUser.id,
        name: dbUser.name,
        username: dbUser.username,
        avatar: dbUser.avatar,
        following: dbUser.following || [],
        reviewedCategories: dbUser.reviewed_categories || [],
        varietyScore: dbUser.variety_score || 0,
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
  }
  // Fallback to localStorage
  const freshUsers = getStorageItem<User[]>("entreete_users", defaultUsers);
  users = freshUsers;
  return freshUsers.find((u) => u.id === id);
}

export async function getReviewsByDishId(dishId: string): Promise<Review[]> {
  if (USE_VERCEL_POSTGRES) {
    try {
      const response = await fetch(`${API_BASE}/api/reviews?dishId=${dishId}`);
      if (!response.ok) return [];
      const dbReviews = await response.json();
      return dbReviews.map((r: any) => ({
        id: r.id,
        dishId: r.dish_id,
        userId: r.user_id,
        rating: r.rating,
        comment: r.comment,
        imageUrl: r.image_url,
        createdAt: new Date(r.created_at),
      }));
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  }
  // Fallback to localStorage
  const freshReviews = getStorageItem<Review[]>("entreete_reviews", []);
  reviews = freshReviews;
  return freshReviews.filter((r) => r.dishId === dishId);
}

export async function getReviewsByUserId(userId: string): Promise<Review[]> {
  if (USE_VERCEL_POSTGRES) {
    try {
      const response = await fetch(`${API_BASE}/api/reviews?userId=${userId}`);
      if (!response.ok) return [];
      const dbReviews = await response.json();
      return dbReviews.map((r: any) => ({
        id: r.id,
        dishId: r.dish_id,
        userId: r.user_id,
        rating: r.rating,
        comment: r.comment,
        imageUrl: r.image_url,
        createdAt: new Date(r.created_at),
      }));
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  }
  // Fallback to localStorage
  const freshReviews = getStorageItem<Review[]>("entreete_reviews", []);
  reviews = freshReviews;
  return freshReviews.filter((r) => r.userId === userId);
}

export function getDiscoveryFeed(userId: string): Review[] {
  const user = users.find((u) => u.id === userId);
  if (!user) return [];
  
  // Get reviews from followed users, sorted by most recent
  return reviews
    .filter((r) => user.following.includes(r.userId))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function calculateVarietyScore(reviewedCategories: FoodCategory[]): number {
  return reviewedCategories.length;
}

// Helper function to get or create user from Clerk ID
export async function getOrCreateUserFromClerkId(clerkUserId: string, clerkUserName?: string, clerkUserImageUrl?: string): Promise<User> {
  if (USE_VERCEL_POSTGRES) {
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
        user = {
          id: dbUser.id,
          name: dbUser.name,
          username: dbUser.username,
          avatar: dbUser.avatar,
          following: dbUser.following || [],
          reviewedCategories: dbUser.reviewed_categories || [],
          varietyScore: dbUser.variety_score || 0,
        };
      } else {
        // Update existing user
        if (clerkUserName) user.name = clerkUserName;
        if (clerkUserImageUrl) user.avatar = clerkUserImageUrl;
        
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
      
      return user;
    } catch (error) {
      console.error("Error getting/creating user:", error);
      // Fallback user
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
  
  // Fallback to localStorage
  let user = users.find((u) => u.id === clerkUserId);
  
  if (!user) {
    user = {
      id: clerkUserId,
      name: clerkUserName || "User",
      username: `@${clerkUserId.slice(0, 8)}`,
      avatar: clerkUserImageUrl,
      following: [],
      reviewedCategories: [],
      varietyScore: 0,
    };
    users.push(user);
    setStorageItem("entreete_users", users);
  } else {
    if (clerkUserName) user.name = clerkUserName;
    if (clerkUserImageUrl) user.avatar = clerkUserImageUrl;
    setStorageItem("entreete_users", users);
  }
  reloadDataFromStorage();
  return user;
}

export async function addReview(
  dishId: string,
  userId: string,
  rating: number,
  comment?: string,
  imageUrl?: string
): Promise<Review> {
  if (USE_VERCEL_POSTGRES) {
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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create review' }));
        throw new Error(errorData.error || `Failed to create review: ${response.status} ${response.statusText}`);
      }
      
      const dbReview = await response.json();
      
      if (!dbReview || dbReview.error) {
        throw new Error(dbReview?.error || 'Failed to create review');
      }
      
      return {
        id: dbReview.id,
        dishId: dbReview.dish_id,
        userId: dbReview.user_id,
        rating: dbReview.rating,
        comment: dbReview.comment,
        imageUrl: dbReview.image_url,
        createdAt: new Date(dbReview.created_at),
      };
    } catch (error) {
      console.error("Error adding review:", error);
      throw error;
    }
  }
  
  // Fallback to localStorage
  const dish = await getDishById(dishId);
  if (!dish) throw new Error("Dish not found");
  
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");
  
  const isNewCategory = !user.reviewedCategories.includes(dish.category);
  
  if (isNewCategory) {
    user.reviewedCategories.push(dish.category);
    user.varietyScore = calculateVarietyScore(user.reviewedCategories);
  }
  
  const newReview: Review = {
    id: `r${reviews.length + 1}`,
    dishId,
    userId,
    rating,
    comment,
    imageUrl,
    createdAt: new Date(),
  };
  
  reviews.push(newReview);
  setStorageItem("entreete_reviews", reviews);
  setStorageItem("entreete_users", users);
  reloadDataFromStorage();
  return newReview;
}

export async function deleteReview(reviewId: string, userId: string): Promise<boolean> {
  if (USE_VERCEL_POSTGRES) {
    try {
      const response = await fetch(`${API_BASE}/api/reviews?id=${reviewId}&userId=${userId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete review");
      }
      
      // Update user's variety score
      const user = await getUserById(userId);
      if (user) {
        const userReviews = await getReviewsByUserId(userId);
        const dishes = await Promise.all(userReviews.map((r) => getDishById(r.dishId)));
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
  
  // Fallback to localStorage
  const reviewIndex = reviews.findIndex((r) => r.id === reviewId);
  if (reviewIndex === -1) return false;
  
  const review = reviews[reviewIndex];
  
  if (review.userId !== userId) {
    throw new Error("Unauthorized: You can only delete your own reviews");
  }
  
  reviews.splice(reviewIndex, 1);
  setStorageItem("entreete_reviews", reviews);
  
  const user = users.find((u) => u.id === userId);
  if (user) {
    const dish = await getDishById(review.dishId);
    if (dish) {
      const hasOtherReviewsInCategory = reviews.some((r) => {
        if (r.userId !== userId || r.id === reviewId) return false;
        // Note: This check is simplified for localStorage fallback
        return true;
      });
      
      if (!hasOtherReviewsInCategory) {
        const categoryIndex = user.reviewedCategories.indexOf(dish.category);
        if (categoryIndex > -1) {
          user.reviewedCategories.splice(categoryIndex, 1);
          user.varietyScore = calculateVarietyScore(user.reviewedCategories);
        }
      }
    }
  }
  
  setStorageItem("entreete_users", users);
  reloadDataFromStorage();
  return true;
}

// Helper to add a new dish
export async function addDish(
  name: string,
  restaurant: string,
  category: FoodCategory,
  location?: string
): Promise<Dish> {
  if (USE_VERCEL_POSTGRES) {
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
      return {
        id: dbDish.id,
        name: dbDish.name,
        restaurant: dbDish.restaurant,
        location: dbDish.location,
        category: dbDish.category,
        description: dbDish.description,
      };
    } catch (error) {
      console.error("Error adding dish:", error);
      throw error;
    }
  }
  
  // Fallback to localStorage
  const newDish: Dish = {
    id: `dish-${Date.now()}`,
    name,
    restaurant,
    category,
    location,
  };
  dishes.push(newDish);
  setStorageItem("entreete_dishes", dishes);
  reloadDataFromStorage();
  return newDish;
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  if (USE_VERCEL_POSTGRES) {
    try {
      const response = await fetch(`${API_BASE}/api/users`);
      if (!response.ok) return [];
      const dbUsers = await response.json();
      return dbUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        following: u.following || [],
        reviewedCategories: u.reviewed_categories || [],
        varietyScore: u.variety_score || 0,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }
  // Fallback to localStorage
  const freshUsers = getStorageItem<User[]>("entreete_users", defaultUsers);
  users = freshUsers;
  return freshUsers;
}

// Get all dishes
export async function getAllDishes(): Promise<Dish[]> {
  if (USE_VERCEL_POSTGRES) {
    try {
      const response = await fetch(`${API_BASE}/api/dishes`);
      if (!response.ok) return [];
      const dbDishes = await response.json();
      return dbDishes.map((d: any) => ({
        id: d.id,
        name: d.name,
        restaurant: d.restaurant,
        location: d.location,
        category: d.category,
        description: d.description,
      }));
    } catch (error) {
      console.error("Error fetching dishes:", error);
      return [];
    }
  }
  return getStorageItem<Dish[]>("entreete_dishes", defaultDishes);
}

// Get all reviews
export async function getAllReviews(): Promise<Review[]> {
  if (USE_VERCEL_POSTGRES) {
    try {
      const response = await fetch(`${API_BASE}/api/reviews`);
      if (!response.ok) return [];
      const dbReviews = await response.json();
      return dbReviews.map((r: any) => ({
        id: r.id,
        dishId: r.dish_id,
        userId: r.user_id,
        rating: r.rating,
        comment: r.comment,
        imageUrl: r.image_url,
        createdAt: new Date(r.created_at),
      }));
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  }
  return getStorageItem<Review[]>("entreete_reviews", []);
}
