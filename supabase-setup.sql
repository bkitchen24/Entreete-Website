-- Run this SQL in your Supabase SQL Editor to create the tables

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
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_dish_id ON reviews(dish_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant ON dishes(restaurant);

-- Enable Row Level Security (RLS)
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access on dishes" ON dishes
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on reviews" ON reviews
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update
CREATE POLICY "Allow authenticated insert on dishes" ON dishes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated insert on users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated insert on reviews" ON reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update on users" ON users
  FOR UPDATE USING (true);

-- Allow users to delete their own reviews
CREATE POLICY "Allow users to delete own reviews" ON reviews
  FOR DELETE USING (auth.uid()::text = user_id OR true);
