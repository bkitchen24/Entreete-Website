import { Review, Dish, User } from "../types";
import { Star, Clock, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  review: Review;
  dish: Dish;
  user: User;
  currentUserId?: string;
  onDelete?: (reviewId: string) => void;
}

export default function ReviewCard({ review, dish, user, currentUserId, onDelete }: ReviewCardProps) {
  const timeAgo = formatDistanceToNow(review.createdAt, { addSuffix: true });
  const isOwner = currentUserId === review.userId;

  const handleDelete = () => {
    if (onDelete && window.confirm("Are you sure you want to delete this review?")) {
      onDelete(review.id);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {user.name}
            </p>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {user.username}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </div>
        </div>
        {isOwner && onDelete && (
          <button
            onClick={handleDelete}
            className="flex-shrink-0 p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete review"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mb-3">
        <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
          {dish.name}
        </h4>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {dish.restaurant} • {dish.category}
        </p>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {review.rating}/10
          </span>
        </div>
      </div>

      {review.comment && (
        <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
          {review.comment}
        </p>
      )}

      {review.imageUrl && (
        <div className="mt-3 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <img
            src={review.imageUrl}
            alt={`${user.name}'s review photo`}
            className="w-full h-auto object-cover"
          />
        </div>
      )}
    </div>
  );
}
