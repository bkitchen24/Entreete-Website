# Supabase Setup Guide

This guide will help you set up Supabase to store your app's data on the server instead of in the browser.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (it's free!)
3. Create a new project:
   - Choose an organization (or create one)
   - Enter a project name (e.g., "entreete")
   - Enter a database password (save this!)
   - Choose a region close to you
   - Click "Create new project"

## Step 2: Get Your API Keys

1. Once your project is created, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (a long string starting with `eyJ...`)

## Step 3: Create the Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase-setup.sql` from this project
4. Paste it into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

## Step 4: Set Up Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add these lines:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the values from Step 2.

## Step 5: Update Your Code

The code has been set up to use Supabase. You just need to:

1. Make sure the environment variables are set
2. Restart your development server:
   ```bash
   npm run dev
   ```

## Step 6: Deploy to Vercel

When deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
4. Redeploy your application

## Testing

After setup:
- Add a dish or review
- Check your Supabase dashboard → **Table Editor** → you should see the data in the tables
- The data will now be shared across all users and devices!

## Troubleshooting

**Error: "Missing Supabase environment variables"**
- Make sure `.env.local` exists and has the correct variable names
- Restart your dev server after adding environment variables

**Error: "relation does not exist"**
- Make sure you ran the SQL script from `supabase-setup.sql`
- Check the SQL Editor for any errors

**Data not showing up**
- Check the browser console for errors
- Verify your API keys are correct in `.env.local`
- Check Supabase dashboard → Table Editor to see if data is being saved
