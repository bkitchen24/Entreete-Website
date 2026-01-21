import postgres from 'postgres'

// Helper to check if Postgres is configured
// Neon typically uses DATABASE_URL, but we'll also check POSTGRES_URL
export const isPostgresConfigured = () => {
  return !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)
}

// Create Postgres connection
// Use DATABASE_URL (Neon) or POSTGRES_URL (Vercel Postgres)
const getPostgresUrl = () => {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || ''
}

// Create sql client - configure for serverless/edge environments
// For Neon, use connection pooling URL if available (ends with -pooler)
// Note: In serverless, we create a new connection per request to avoid connection issues
const getSqlClient = () => {
  if (!isPostgresConfigured()) return null
  
  // Create new connection for each request in serverless
  // This avoids connection pool issues in serverless environments
  const connectionUrl = getPostgresUrl()
  
  // Remove channel_binding from URL if present (can cause issues)
  const cleanUrl = connectionUrl.replace(/[?&]channel_binding=[^&]*/g, '')
  
  return postgres(cleanUrl, {
    max: 1, // Limit connection pool for serverless
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: 'require', // Neon requires SSL
  })
}

// Database helper functions
export async function getDishById(id: string) {
  const sql = getSqlClient()
  if (!sql) return null
  
  try {
    const result = await sql`
      SELECT * FROM dishes WHERE id = ${id}
    `
    await sql.end()
    return result[0] || null
  } catch (error) {
    console.error('Error fetching dish:', error)
    if (sql) await sql.end().catch(() => {})
    return null
  }
}

export async function getAllDishes() {
  const sql = getSqlClient()
  if (!sql) return []
  
  try {
    const result = await sql`
      SELECT * FROM dishes ORDER BY created_at DESC
    `
    await sql.end()
    return result
  } catch (error) {
    console.error('Error fetching dishes:', error)
    if (sql) await sql.end().catch(() => {})
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
  const sql = getSqlClient()
  if (!sql) return null
  
  try {
    const result = await sql`
      INSERT INTO dishes (id, name, restaurant, category, location)
      VALUES (${dish.id}, ${dish.name}, ${dish.restaurant}, ${dish.category}, ${dish.location || null})
      RETURNING *
    `
    await sql.end()
    return result[0]
  } catch (error) {
    console.error('Error creating dish:', error)
    if (sql) await sql.end().catch(() => {})
    throw error
  }
}

export async function getUserById(id: string) {
  const sql = getSqlClient()
  if (!sql) return null
  
  try {
    const result = await sql`
      SELECT * FROM users WHERE id = ${id}
    `
    await sql.end()
    return result[0] || null
  } catch (error) {
    console.error('Error fetching user:', error)
    if (sql) await sql.end().catch(() => {})
    return null
  }
}

export async function getAllUsers() {
  const sql = getSqlClient()
  if (!sql) return []
  
  try {
    const result = await sql`
      SELECT * FROM users
    `
    await sql.end()
    return result
  } catch (error) {
    console.error('Error fetching users:', error)
    if (sql) await sql.end().catch(() => {})
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
  const sql = getSqlClient()
  if (!sql) return null
  
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
    await sql.end()
    return result[0]
  } catch (error) {
    console.error('Error creating/updating user:', error)
    if (sql) await sql.end().catch(() => {})
    throw error
  }
}

export async function getReviewsByDishId(dishId: string) {
  const sql = getSqlClient()
  if (!sql) return []
  
  try {
    const result = await sql`
      SELECT * FROM reviews WHERE dish_id = ${dishId} ORDER BY created_at DESC
    `
    await sql.end()
    return result
  } catch (error) {
    console.error('Error fetching reviews:', error)
    if (sql) await sql.end().catch(() => {})
    return []
  }
}

export async function getReviewsByUserId(userId: string) {
  const sql = getSqlClient()
  if (!sql) return []
  
  try {
    const result = await sql`
      SELECT * FROM reviews WHERE user_id = ${userId} ORDER BY created_at DESC
    `
    await sql.end()
    return result
  } catch (error) {
    console.error('Error fetching reviews:', error)
    if (sql) await sql.end().catch(() => {})
    return []
  }
}

export async function getAllReviews() {
  const sql = getSqlClient()
  if (!sql) return []
  
  try {
    const result = await sql`
      SELECT * FROM reviews ORDER BY created_at DESC
    `
    await sql.end()
    return result
  } catch (error) {
    console.error('Error fetching reviews:', error)
    if (sql) await sql.end().catch(() => {})
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
  const sql = getSqlClient()
  if (!sql) return null
  
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
    await sql.end()
    return result[0]
  } catch (error) {
    console.error('Error creating review:', error)
    if (sql) await sql.end().catch(() => {})
    throw error
  }
}

export async function deleteReview(reviewId: string, userId: string) {
  const sql = getSqlClient()
  if (!sql) return false
  
  try {
    // First verify the review belongs to the user
    const checkResult = await sql`
      SELECT user_id FROM reviews WHERE id = ${reviewId}
    `
    
    if (checkResult.length === 0) {
      await sql.end()
      return false
    }
    
    if (checkResult[0].user_id !== userId) {
      await sql.end()
      throw new Error('Unauthorized: You can only delete your own reviews')
    }
    
    await sql`
      DELETE FROM reviews WHERE id = ${reviewId}
    `
    
    await sql.end()
    return true
  } catch (error) {
    console.error('Error deleting review:', error)
    if (sql) await sql.end().catch(() => {})
    throw error
  }
}
