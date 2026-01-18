import { MapPin, MessageSquare } from "lucide-react";

interface RestaurantCardProps {
  name: string;
  location: string;
  reviewCount?: number;
  onClick?: () => void;
}

export default function RestaurantCard({ name, location, reviewCount = 0, onClick }: RestaurantCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow shadow-sm"
    >
      <h3 className="font-semibold text-zinc-900 text-lg mb-2">
        {name}
      </h3>
      <div className="flex items-start gap-2 mb-3">
        <MapPin className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-zinc-600">
          {location}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <MessageSquare className="w-4 h-4 text-zinc-400" />
        <span className="text-sm text-zinc-500">
          {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
        </span>
      </div>
    </div>
  );
}
