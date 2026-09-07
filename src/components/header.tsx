"use client";

import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  userName?: string;
}

export function Header({ title, userName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
              EV
            </div>
            <span className="hidden text-lg font-semibold text-gray-900 sm:inline">
              EduVerse
            </span>
          </Link>
          {title && (
            <span className="text-sm font-medium text-gray-600 sm:hidden">
              {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {userName && (
            <span className="hidden text-sm text-gray-600 sm:inline">
              Hi, {userName.split(" ")[0]}
            </span>
          )}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </Button>
        </div>
      </div>
    </header>
  );
}
