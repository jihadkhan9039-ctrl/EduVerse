"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  userName?: string;
}

export function Header({ title, userName }: HeaderProps) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    async function loadUnread() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setUnread(0);
        return;
      }

      const { data: notifications } = await supabase
        .from("notifications")
        .select("id");

      if (!notifications || notifications.length === 0) {
        setUnread(0);
        return;
      }

      const { data: reads } = await supabase
        .from("notification_reads")
        .select("notification_id")
        .eq("user_id", user.id);

      const readIds = new Set((reads ?? []).map((r) => r.notification_id));
      const count = notifications.filter((n) => !readIds.has(n.id)).length;
      setUnread(count);
    }

    loadUnread();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-sm">
              EV
            </div>
            <span className="text-lg font-semibold text-gray-900">
              EduVerse
            </span>
          </Link>
          {title && (
            <span className="hidden text-sm font-medium text-gray-500 sm:inline">
              · {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {userName && (
            <span className="hidden text-sm text-gray-600 sm:inline">
              Hi, {userName.split(" ")[0]}
            </span>
          )}
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
