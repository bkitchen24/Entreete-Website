import { NextResponse } from 'next/server'

export async function GET() {
  // This endpoint helps debug database connection issues
  const hasDatabaseUrl = !!process.env.DATABASE_URL
  const hasPostgresUrl = !!process.env.POSTGRES_URL
  const databaseUrl = process.env.DATABASE_URL
  const postgresUrl = process.env.POSTGRES_URL
  
  // Don't expose full connection strings, just show if they exist and first/last chars
  const maskUrl = (url: string | undefined) => {
    if (!url) return null
    if (url.length < 20) return '***'
    return `${url.substring(0, 10)}...${url.substring(url.length - 10)}`
  }

  return NextResponse.json({
    has_database_url: hasDatabaseUrl,
    has_postgres_url: hasPostgresUrl,
    database_url_preview: maskUrl(databaseUrl),
    postgres_url_preview: maskUrl(postgresUrl),
    node_env: process.env.NODE_ENV,
    note: hasDatabaseUrl || hasPostgresUrl
      ? 'Environment variable is set. Check Vercel logs for connection errors.'
      : 'Environment variable is NOT set. Add DATABASE_URL in Vercel Settings → Environment Variables.'
  })
}
