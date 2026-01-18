This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Dish Review System**: Rate specific menu items on a 1-10 scale
- **Discovery Feed**: See reviews from people you follow
- **Variety Score**: Track your food exploration across different cuisines
- **Restaurant Search**: Find restaurants using Google Places API
- **Mobile-Responsive**: Optimized for all device sizes

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase Database (Required for Data Persistence)

To store data on the server instead of in the browser:

1. Go to [Supabase](https://supabase.com/) and create a free account
2. Create a new project
3. Go to **Settings** → **API** and copy:
   - **Project URL** (your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Go to **SQL Editor** in your Supabase dashboard
5. Copy and paste the contents of `supabase-setup.sql` into the SQL Editor
6. Click **Run** to create the database tables
7. Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Google Maps API (Optional)

To enable restaurant search functionality:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API (New)**
   - **Maps JavaScript API**
4. Create an API key in the Credentials section
5. Add to your `.env.local` file:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Note**: The app will work without the API key, but the restaurant search feature will be disabled.

### 4. Run the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
