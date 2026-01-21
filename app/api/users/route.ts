import { NextResponse } from 'next/server'
import { getUserById as dbGetUserById, getAllUsers as dbGetAllUsers, createOrUpdateUser as dbCreateOrUpdateUser, isPostgresConfigured } from '../../../lib/db'

export async function GET(request: Request) {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const user = await dbGetUserById(id)
      return NextResponse.json(user)
    } else {
      const users = await dbGetAllUsers()
      return NextResponse.json(users)
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }
  try {
    const body = await request.json()
    const user = await dbCreateOrUpdateUser(body)
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error creating/updating user:', error)
    return NextResponse.json({ error: 'Failed to create/update user' }, { status: 500 })
  }
}
