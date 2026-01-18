import { User } from "../types";
import { Award, User as UserIcon } from "lucide-react";

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <UserIcon className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            {user.name}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-3">
            {user.username}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        <div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Variety Score
          </p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {user.varietyScore}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            {user.reviewedCategories.length} category
            {user.reviewedCategories.length !== 1 ? "ies" : "y"} explored
          </p>
        </div>
      </div>

      {user.reviewedCategories.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Categories Reviewed:
          </p>
          <div className="flex flex-wrap gap-2">
            {user.reviewedCategories.map((category) => (
              <span
                key={category}
                className="px-2 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
