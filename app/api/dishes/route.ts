import { NextResponse } from 'next/server'
import { getDishById as dbGetDishById, getAllDishes as dbGetAllDishes, createDish as dbCreateDish, isPostgresConfigured } from '../../../lib/db'

export async function GET(request: Request) {
  if (!isPostgresConfigured()) {
    console.error('Database not configured - DATABASE_URL:', !!process.env.DATABASE_URL, 'POSTGRES_URL:', !!process.env.POSTGRES_URL)
    return NextResponse.json({ 
      error: 'Database not configured',
      debug: {
        has_database_url: !!process.env.DATABASE_URL,
        has_postgres_url: !!process.env.POSTGRES_URL,
      }
    }, { status: 503 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (id) {
      const dish = await dbGetDishById(id)
      return NextResponse.json(dish)
    } else {
      const dishes = await dbGetAllDishes()
      return NextResponse.json(dishes)
    }
  } catch (error: any) {
    console.error('Error fetching dishes:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch dishes',
      message: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  try {
    const body = await request.json()
    const dish = await dbCreateDish(body)
    return NextResponse.json(dish)
  } catch (error) {
    console.error('Error creating dish:', error)
    return NextResponse.json({ error: 'Failed to create dish' }, { status: 500 })
  }
}
