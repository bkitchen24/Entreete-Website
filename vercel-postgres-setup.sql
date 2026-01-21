-- Run this SQL in Vercel Postgres to create the tables
-- You can access this via Vercel Dashboard → Storage → Postgres → SQL Editor

-- Create dishes table
CREATE TABLE IF NOT EXISTS dishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  restaurant TEXT NOT NULL,
  location TEXT,
  category TEXT NOT NULL CHECK (category IN ('Main Dish', 'Appetizer', 'Beverage', 'Dessert', 'Other')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT,
  following TEXT[] DEFAULT '{}',
  reviewed_categories TEXT[] DEFAULT '{}',
  variety_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  dish_id TEXT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  comment TEXT,
  image_url TEXT, -- URL from Vercel Blob
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_dish_id ON reviews(dish_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant ON dishes(restaurant);
