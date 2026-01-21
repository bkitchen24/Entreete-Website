# Neon Postgres Setup Guide

This guide will help you set up Neon Postgres for your dish review app.

## ✅ What's Already Done

1. ✅ Code updated to use Neon Postgres (standard `postgres` package)
2. ✅ Database connection configured for Neon
3. ✅ SQL script ready to create tables

## 📋 Setup Checklist

### Step 1: Add DATABASE_URL to Vercel ✅
- [x] Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- [x] Add `DATABASE_URL` with your Neon connection string:
  ```
  postgresql://neondb_owner:npg_xP5QjkWcEUn7@ep-super-math-ahi3ggr7-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
  ```
- [x] Select all environments (Production, Preview, Development)
- [x] Save

### Step 2: Create Database Tables
- [ ] Open Neon Dashboard → Your Database → SQL Editor
- [ ] Copy the SQL script from `vercel-postgres-setup.sql`
- [ ] Paste and run it in Neon's SQL Editor
- [ ] Verify tables are created (dishes, users, reviews)

### Step 3: Verify BLOB_READ_WRITE_TOKEN
- [ ] Check Vercel Environment Variables for `BLOB_READ_WRITE_TOKEN`
- [ ] Should be: `vercel_blob_rw_G13amuh35QrTv8qM_7aZDu0iGYPSqZOuMI9LMVu9ukMNNyA`

### Step 4: Test the Connection
After deployment, visit:
```
https://your-app.vercel.app/api/test-db
```

Expected response:
```json
{
  "postgres_configured": true,
  "has_database_url": true,
  "has_postgres_url": false,
  "connection_test": "connected",
  "error": null
}
```

## 🔍 Troubleshooting

**Connection fails:**
- Verify `DATABASE_URL` is set in Vercel
- Check Neon dashboard to ensure database is active
- Verify connection string is correct

**"relation does not exist" error:**
- Run the SQL script in Neon to create tables
- Check table names match (dishes, users, reviews)

**Images not uploading:**
- Verify `BLOB_READ_WRITE_TOKEN` is set
- Check Vercel Blob store is created

## 📝 SQL Script Location

The SQL script is in: `vercel-postgres-setup.sql`

Run it in Neon's SQL Editor to create all necessary tables.
