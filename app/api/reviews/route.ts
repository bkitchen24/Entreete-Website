import { NextResponse } from 'next/server'
import { 
  getReviewsByDishId as dbGetReviewsByDishId, 
  getReviewsByUserId as dbGetReviewsByUserId,
  getAllReviews as dbGetAllReviews,
  createReview as dbCreateReview,
  deleteReview as dbDeleteReview,
  isPostgresConfigured 
} from '../../../lib/db'

export async function GET(request: Request) {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const dishId = searchParams.get('dishId')
    const userId = searchParams.get('userId')

    let reviews
    if (dishId) {
      reviews = await dbGetReviewsByDishId(dishId)
    } else if (userId) {
      reviews = await dbGetReviewsByUserId(userId)
    } else {
      reviews = await dbGetAllReviews()
    }

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.dish_id || !body.user_id || !body.rating) {
      return NextResponse.json({ 
        error: 'Missing required fields: dish_id, user_id, and rating are required' 
      }, { status: 400 })
    }
    
    const review = await dbCreateReview(body)
    
    if (!review) {
      return NextResponse.json({ error: 'Failed to create review - no data returned' }, { status: 500 })
    }
    
    return NextResponse.json(review)
  } catch (error: any) {
    console.error('Error creating review:', error)
    const errorMessage = error?.message || 'Failed to create review'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!id || !userId) {
      return NextResponse.json({ error: 'Missing id or userId' }, { status: 400 })
    }

    const success = await dbDeleteReview(id, userId)
    return NextResponse.json({ success })
  } catch (error) {
    console.error('Error deleting review:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete review'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
