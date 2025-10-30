import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const Navbar = () => {
  const [location] = useLocation();

  // Don't render if on booth routes
  if (location.startsWith("/booth")) {
    return null;
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/playlist", label: "Playlist" },
    { href: "/chat", label: "Guestbook" },
  ];

  return (
    <nav className={cn(
      "fixed top-0 inset-x-0",
      "hidden md:flex", // Only visible on desktop
      "z-50",
      "border-b border-border",
      "bg-background/90 supports-[backdrop-filter]:bg-background/60 backdrop-blur"
    )}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/">
          <div className="text-xl font-bold cursor-pointer hover:text-primary transition-colors">
            DJ Garnet
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md",
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
          <div className="w-px h-6 bg-border mx-2" />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
