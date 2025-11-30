import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const BottomNav = () => {
  const [location] = useLocation();

  // Don't render if on booth routes
  if (location.startsWith("/booth")) {
    return null;
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/playlist", label: "Playlist" },
  ];

  return (
    <nav className={cn(
      "fixed inset-x-0 bottom-4",
      "flex md:hidden", // Only visible on mobile
      "z-50",
      "pointer-events-none",
      "bg-transparent",
      "w-full justify-center",
      "mb-[env(safe-area-inset-bottom)]" // Safe area padding for iOS
    )}>
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-background/90 supports-[backdrop-filter]:bg-background/60 backdrop-blur shadow-lg px-3 py-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full",
                  "transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {item.label}
              </button>
            </Link>
          );
        })}
        <div className="w-px h-6 bg-border mx-1" />
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default BottomNav;