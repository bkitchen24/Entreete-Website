import { Dish, Review, User, FoodCategory } from "./types";

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
function getStorageItem<T>(key: string, defaultValue: T): T {
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
export let dishes: Dish[] = getStorageItem("entreete_dishes", defaultDishes);
export let reviews: Review[] = getStorageItem("entreete_reviews", []);

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
  dishes = getStorageItem("entreete_dishes", defaultDishes);
  reviews = getStorageItem("entreete_reviews", []);
  users = getStorageItem("entreete_users", defaultUsers);
}

// Helper functions
export function getDishById(id: string): Dish | undefined {
  return dishes.find((d) => d.id === id);
}

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getReviewsByDishId(dishId: string): Review[] {
  return reviews.filter((r) => r.dishId === dishId);
}

export function getReviewsByUserId(userId: string): Review[] {
  return reviews.filter((r) => r.userId === userId);
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
export function getOrCreateUserFromClerkId(clerkUserId: string, clerkUserName?: string, clerkUserImageUrl?: string): User {
  let user = users.find((u) => u.id === clerkUserId);
  
  if (!user) {
    // Create new user from Clerk data
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
    // Update existing user with latest Clerk data
    if (clerkUserName) user.name = clerkUserName;
    if (clerkUserImageUrl) user.avatar = clerkUserImageUrl;
    setStorageItem("entreete_users", users);
  }
  // Reload to ensure all components see the update
  reloadDataFromStorage();
  return user;
}

export function addReview(
  dishId: string,
  userId: string,
  rating: number,
  comment?: string,
  imageUrl?: string
): Review {
  const dish = getDishById(dishId);
  if (!dish) throw new Error("Dish not found");
  
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");
  
  // Check if this is a new category for the user
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
  // Reload to ensure all components see the update
  reloadDataFromStorage();
  return newReview;
}

export function deleteReview(reviewId: string, userId: string): boolean {
  const reviewIndex = reviews.findIndex((r) => r.id === reviewId);
  if (reviewIndex === -1) return false;
  
  const review = reviews[reviewIndex];
  
  // Only allow deletion if the user owns the review
  if (review.userId !== userId) {
    throw new Error("Unauthorized: You can only delete your own reviews");
  }
  
  // Remove the review
  reviews.splice(reviewIndex, 1);
  setStorageItem("entreete_reviews", reviews);
  
  // Update user's variety score if needed
  const user = users.find((u) => u.id === userId);
  if (user) {
    const dish = getDishById(review.dishId);
    if (dish) {
      // Check if user still has reviews for dishes in this category
      const hasOtherReviewsInCategory = reviews.some((r) => {
        if (r.userId !== userId || r.id === reviewId) return false;
        const otherDish = getDishById(r.dishId);
        return otherDish && otherDish.category === dish.category;
      });
      
      if (!hasOtherReviewsInCategory) {
        // Remove category from user's reviewed categories
        const categoryIndex = user.reviewedCategories.indexOf(dish.category);
        if (categoryIndex > -1) {
          user.reviewedCategories.splice(categoryIndex, 1);
          user.varietyScore = calculateVarietyScore(user.reviewedCategories);
        }
      }
    }
  }
  
  setStorageItem("entreete_users", users);
  // Reload to ensure all components see the update
  reloadDataFromStorage();
  return true;
}

// Helper to add a new dish
export function addDish(
  name: string,
  restaurant: string,
  category: FoodCategory,
  location?: string
): Dish {
  const newDish: Dish = {
    id: `dish-${Date.now()}`,
    name,
    restaurant,
    category,
    location,
  };
  dishes.push(newDish);
  setStorageItem("entreete_dishes", dishes);
  // Reload to ensure all components see the update
  reloadDataFromStorage();
  return newDish;
}
