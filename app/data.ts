import { Dish, Review, User, FoodCategory } from "./types";

// Mock data store
export const dishes: Dish[] = [
  { id: "1", name: "Margherita Pizza", restaurant: "Tony's Italian", location: "123 Main St, New York, NY 10001", category: "Main Dish" },
  { id: "2", name: "Pad Thai", restaurant: "Bangkok Express", location: "456 Broadway, New York, NY 10013", category: "Main Dish" },
  { id: "3", name: "Tacos al Pastor", restaurant: "El Mariachi", location: "789 5th Ave, New York, NY 10022", category: "Main Dish" },
  { id: "4", name: "Ramen", restaurant: "Tokyo Ramen", location: "321 Lexington Ave, New York, NY 10016", category: "Main Dish" },
  { id: "5", name: "Kung Pao Chicken", restaurant: "Golden Dragon", location: "654 Park Ave, New York, NY 10021", category: "Main Dish" },
  { id: "6", name: "Butter Chicken", restaurant: "Taj Mahal", location: "987 Madison Ave, New York, NY 10075", category: "Main Dish" },
  { id: "7", name: "Bibimbap", restaurant: "Seoul Kitchen", location: "147 2nd Ave, New York, NY 10003", category: "Main Dish" },
  { id: "8", name: "Pho", restaurant: "Saigon Street", location: "258 3rd Ave, New York, NY 10010", category: "Main Dish" },
];

export const users: User[] = [
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

export const reviews: Review[] = [
  {
    id: "r1",
    dishId: "1",
    userId: "user1",
    rating: 8,
    comment: "Great classic pizza!",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "r2",
    dishId: "2",
    userId: "user2",
    rating: 9,
    comment: "Authentic and delicious!",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: "r3",
    dishId: "3",
    userId: "user2",
    rating: 7,
    comment: "Good but could use more spice",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "r4",
    dishId: "4",
    userId: "user3",
    rating: 10,
    comment: "Perfect ramen! Best I've had.",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    id: "r5",
    dishId: "5",
    userId: "user2",
    rating: 6,
    comment: "Decent but not amazing",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
];

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
  } else {
    // Update existing user with latest Clerk data
    if (clerkUserName) user.name = clerkUserName;
    if (clerkUserImageUrl) user.avatar = clerkUserImageUrl;
  }
  
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
  return newDish;
}
