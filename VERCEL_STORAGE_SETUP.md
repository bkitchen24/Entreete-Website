# Vercel Storage Setup Guide

This guide will help you set up Vercel Postgres (for data) and Vercel Blob (for images) to store your app's data on Vercel's servers.

## Step 1: Set Up Vercel Postgres

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create Database** → **Postgres**
3. Create a new Postgres database (free tier available)
4. Once created, Vercel will automatically add the `POSTGRES_URL` environment variable

## Step 2: Create Database Tables

1. In Vercel dashboard, go to **Storage** → **Postgres** → **SQL Editor**
2. Copy the entire contents of `vercel-postgres-setup.sql` from this project
3. Paste it into the SQL Editor
4. Click **Run** to execute the SQL
5. You should see "Success" message

## Step 3: Set Up Vercel Blob (for images)

1. In Vercel dashboard, go to **Storage** → **Create Database** → **Blob**
2. Create a new Blob store (free tier available)
3. Vercel will automatically add the `BLOB_READ_WRITE_TOKEN` environment variable

## Step 4: Verify Environment Variables

Vercel should automatically add these environment variables:
- `POSTGRES_URL` - for database connection
- `BLOB_READ_WRITE_TOKEN` - for blob storage

You can verify these in **Settings** → **Environment Variables**

## Step 5: Deploy

1. Push your code to trigger a new deployment
2. The app will automatically use Vercel Postgres and Blob when these environment variables are present

## Testing

After setup:
- Add a dish or review with an image
- Check Vercel dashboard → **Storage** → **Postgres** → **Table Editor** to see data
- Check Vercel dashboard → **Storage** → **Blob** to see uploaded images
- The data will now be shared across all users and devices!

## Benefits

- **Everything in one place**: Database and file storage in Vercel
- **Automatic scaling**: Vercel handles infrastructure
- **Free tier available**: Great for getting started
- **Easy integration**: Works seamlessly with Next.js

## Troubleshooting

**Error: "relation does not exist"**
- Make sure you ran the SQL script from `vercel-postgres-setup.sql`
- Check the SQL Editor for any errors

**Images not uploading**
- Verify `BLOB_READ_WRITE_TOKEN` is set in environment variables
- Check the browser console for errors

**Data not showing up**
- Verify `POSTGRES_URL` is set in environment variables
- Check Vercel Postgres → Table Editor to see if data is being saved
