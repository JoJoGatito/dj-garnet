import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const [location] = useLocation();

  // Don't render if on booth routes
  if (location.startsWith("/booth")) {
    return null;
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/requests", label: "Requests" },
    { href: "/chat", label: "Chat" },
  ];

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0",
      "flex md:hidden", // Only visible on mobile
      "z-40",
      "border-t border-border",
      "bg-background",
      "w-full",
      "pb-[env(safe-area-inset-bottom)]" // Safe area padding for iOS
    )}>
      <div className="flex justify-around items-center p-3">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md",
                  "transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;