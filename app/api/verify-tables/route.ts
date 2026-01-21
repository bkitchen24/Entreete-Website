import { NextResponse } from 'next/server'
import { isPostgresConfigured } from '../../../lib/db'
import postgres from 'postgres'

export async function GET() {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ 
      error: 'Database not configured',
      note: 'Set DATABASE_URL environment variable'
    }, { status: 503 })
  }

  const getPostgresUrl = () => {
    return process.env.DATABASE_URL || process.env.POSTGRES_URL || ''
  }

  const sql = postgres(getPostgresUrl(), {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: 'require',
  })

  try {
    // Check if tables exist
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('dishes', 'users', 'reviews')
      ORDER BY table_name
    `

    const existingTables = tablesResult.map((row: any) => row.table_name)
    const requiredTables = ['dishes', 'users', 'reviews']
    const missingTables = requiredTables.filter(t => !existingTables.includes(t))

    // Get table counts
    const counts: Record<string, number> = {}
    for (const table of existingTables) {
      try {
        const countResult = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`
        counts[table] = parseInt(countResult[0].count)
      } catch (err) {
        counts[table] = -1 // Error reading table
      }
    }

    await sql.end()

    return NextResponse.json({
      success: true,
      existing_tables: existingTables,
      missing_tables: missingTables,
      all_tables_exist: missingTables.length === 0,
      table_counts: counts,
      note: missingTables.length === 0 
        ? 'All tables exist! Your database is ready to use.'
        : `Missing tables: ${missingTables.join(', ')}. Run the SQL script to create them.`
    })
  } catch (error: any) {
    await sql.end()
    return NextResponse.json({
      success: false,
      error: error.message,
      note: 'Error checking tables. Verify DATABASE_URL is correct.'
    }, { status: 500 })
  }
}
