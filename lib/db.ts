import { sql } from '@vercel/postgres'

// Helper to check if Vercel Postgres is configured
export const isPostgresConfigured = () => {
  return !!process.env.POSTGRES_URL
}

// Database helper functions
export async function getDishById(id: string) {
  if (!isPostgresConfigured()) return null
  
  try {
    const result = await sql`
      SELECT * FROM dishes WHERE id = ${id}
    `
    return result.rows[0] || null
  } catch (error) {
    console.error('Error fetching dish:', error)
    return null
  }
}

export async function getAllDishes() {
  if (!isPostgresConfigured()) return []
  
  try {
    const result = await sql`
      SELECT * FROM dishes ORDER BY created_at DESC
    `
    return result.rows
  } catch (error) {
    console.error('Error fetching dishes:', error)
    return []
  }
}

export async function createDish(dish: {
  id: string
  name: string
  restaurant: string
  category: string
  location?: string
}) {
  if (!isPostgresConfigured()) return null
  
  try {
    const result = await sql`
      INSERT INTO dishes (id, name, restaurant, category, location)
      VALUES (${dish.id}, ${dish.name}, ${dish.restaurant}, ${dish.category}, ${dish.location || null})
      RETURNING *
    `
    return result.rows[0]
  } catch (error) {
    console.error('Error creating dish:', error)
    throw error
  }
}

export async function getUserById(id: string) {
  if (!isPostgresConfigured()) return null
  
  try {
    const result = await sql`
      SELECT * FROM users WHERE id = ${id}
    `
    return result.rows[0] || null
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function getAllUsers() {
  if (!isPostgresConfigured()) return []
  
  try {
    const result = await sql`
      SELECT * FROM users
    `
    return result.rows
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export async function createOrUpdateUser(user: {
  id: string
  name: string
  username: string
  avatar?: string
  following?: string[]
  reviewed_categories?: string[]
  variety_score?: number
}) {
  if (!isPostgresConfigured()) return null
  
  try {
    const result = await sql`
      INSERT INTO users (id, name, username, avatar, following, reviewed_categories, variety_score)
      VALUES (
        ${user.id},
        ${user.name},
        ${user.username},
        ${user.avatar || null},
        ${JSON.stringify(user.following || [])},
        ${JSON.stringify(user.reviewed_categories || [])},
        ${user.variety_score || 0}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        username = EXCLUDED.username,
        avatar = EXCLUDED.avatar,
        following = EXCLUDED.following,
        reviewed_categories = EXCLUDED.reviewed_categories,
        variety_score = EXCLUDED.variety_score,
        updated_at = NOW()
      RETURNING *
    `
    return result.rows[0]
  } catch (error) {
    console.error('Error creating/updating user:', error)
    throw error
  }
}

export async function getReviewsByDishId(dishId: string) {
  if (!isPostgresConfigured()) return []
  
  try {
    const result = await sql`
      SELECT * FROM reviews WHERE dish_id = ${dishId} ORDER BY created_at DESC
    `
    return result.rows
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

export async function getReviewsByUserId(userId: string) {
  if (!isPostgresConfigured()) return []
  
  try {
    const result = await sql`
      SELECT * FROM reviews WHERE user_id = ${userId} ORDER BY created_at DESC
    `
    return result.rows
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

export async function getAllReviews() {
  if (!isPostgresConfigured()) return []
  
  try {
    const result = await sql`
      SELECT * FROM reviews ORDER BY created_at DESC
    `
    return result.rows
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

export async function createReview(review: {
  id: string
  dish_id: string
  user_id: string
  rating: number
  comment?: string
  image_url?: string
}) {
  if (!isPostgresConfigured()) return null
  
  try {
    const result = await sql`
      INSERT INTO reviews (id, dish_id, user_id, rating, comment, image_url)
      VALUES (
        ${review.id},
        ${review.dish_id},
        ${review.user_id},
        ${review.rating},
        ${review.comment || null},
        ${review.image_url || null}
      )
      RETURNING *
    `
    return result.rows[0]
  } catch (error) {
    console.error('Error creating review:', error)
    throw error
  }
}

export async function deleteReview(reviewId: string, userId: string) {
  if (!isPostgresConfigured()) return false
  
  try {
    // First verify the review belongs to the user
    const checkResult = await sql`
      SELECT user_id FROM reviews WHERE id = ${reviewId}
    `
    
    if (checkResult.rows.length === 0) {
      return false
    }
    
    if (checkResult.rows[0].user_id !== userId) {
      throw new Error('Unauthorized: You can only delete your own reviews')
    }
    
    await sql`
      DELETE FROM reviews WHERE id = ${reviewId}
    `
    
    return true
  } catch (error) {
    console.error('Error deleting review:', error)
    throw error
  }
}
