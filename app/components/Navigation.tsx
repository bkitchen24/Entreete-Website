"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, User } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: Home, label: "Restaurants" },
    { href: "/discovery", icon: Compass, label: "Discovery" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/" && pathname?.startsWith("/restaurant"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-3 px-6 transition-colors ${
                  isActive
                    ? "text-zinc-900"
                    : "text-zinc-500"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
