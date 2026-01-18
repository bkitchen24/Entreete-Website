import { Dish } from "../types";
import { UtensilsCrossed, MapPin, MessageSquare } from "lucide-react";

interface DishCardProps {
  dish: Dish;
  onSelect?: (dish: Dish) => void;
  reviewCount?: number;
}

export default function DishCard({ dish, onSelect, reviewCount = 0 }: DishCardProps) {
  return (
    <div
      onClick={() => onSelect?.(dish)}
      className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <UtensilsCrossed className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {dish.name}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
            {dish.restaurant}
          </p>
          {dish.location && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {dish.location}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {dish.category}
            </span>
            {reviewCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <MessageSquare className="w-3 h-3" />
                <span>{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
