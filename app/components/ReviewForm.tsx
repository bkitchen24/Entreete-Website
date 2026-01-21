"use client";

import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { Star, Send, LogIn, Image as ImageIcon, X } from "lucide-react";
import { Dish } from "../types";

interface ReviewFormProps {
  dish: Dish;
  userId: string;
  onSubmit: (rating: number, comment: string, imageUrl?: string) => void;
}

export default function ReviewForm({ dish, userId, onSubmit }: ReviewFormProps) {
  const { isSignedIn, user } = useUser();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating >= 1 && rating <= 10) {
      let imageUrl: string | undefined;
      
      // Upload image to Vercel Blob if present
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append('file', imageFile);
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (uploadResponse.ok) {
            const { url } = await uploadResponse.json();
            imageUrl = url;
          } else {
            console.error('Failed to upload image');
            alert('Failed to upload image. Please try again.');
            return;
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Error uploading image. Please try again.');
          return;
        }
      }
      
      onSubmit(rating, comment, imageUrl);
      setComment("");
      setRating(5);
      setImagePreview(null);
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Show sign-in prompt if user is not authenticated
  if (!isSignedIn) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 text-center">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Review {dish.name}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Sign in to rate and review this dish
        </p>
        <SignInButton mode="modal">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign in to Rate an Entree
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
        Review {dish.name}
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Rating (1-10)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="10"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
          />
          <div className="flex items-center gap-1 min-w-[60px]">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 w-8 text-center">
              {rating}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Comment (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400 resize-none"
          rows={3}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Photo (optional)
        </label>
        <div className="space-y-2">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-zinc-300 dark:border-zinc-700"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              <ImageIcon className="w-5 h-5 text-zinc-500" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Add a photo
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Max file size: 5MB
        </p>
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
      >
        <Send className="w-4 h-4" />
        Submit Review
      </button>
    </form>
  );
}
