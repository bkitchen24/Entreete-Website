import { NextResponse } from 'next/server'
import { isPostgresConfigured, getAllDishes } from '../../../lib/db'

export async function GET() {
  const isConfigured = isPostgresConfigured()
  const hasDatabaseUrl = !!process.env.DATABASE_URL
  const hasPostgresUrl = !!process.env.POSTGRES_URL
  
  let testResult = 'unknown'
  let error = null
  
  if (isConfigured) {
    try {
      // Try to query the database
      const dishes = await getAllDishes()
      testResult = 'connected'
    } catch (err: any) {
      testResult = 'error'
      error = err.message
    }
  }
  
  return NextResponse.json({
    postgres_configured: isConfigured,
    has_database_url: hasDatabaseUrl,
    has_postgres_url: hasPostgresUrl,
    connection_test: testResult,
    error: error,
    note: isConfigured 
      ? 'Postgres is configured. If connection_test is "error", you may need to run the SQL script to create tables.'
      : 'Postgres is not configured. Set DATABASE_URL (Neon) or POSTGRES_URL (Vercel Postgres) environment variable.'
  })
}
