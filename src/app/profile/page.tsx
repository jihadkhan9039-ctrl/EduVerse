"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ShoppingBag, LogOut, User } from "lucide-react";
import type { Profile } from "@/types/database";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <Header />
      <main className="mx-auto max-w-lg px-4 py-6">
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center p-6">
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <User className="h-10 w-10" />
              )}
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              {profile?.full_name || "User"}
            </h1>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <span className="mt-2 rounded-full bg-brand-50 px-3 py-0.5 text-xs font-medium capitalize text-brand-700">
              {profile?.role}
            </span>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Link href="/courses?enrolled=true">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-4">
                <BookOpen className="h-5 w-5 text-brand-600" />
                <span className="font-medium">My Courses</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile/orders">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-4">
                <ShoppingBag className="h-5 w-5 text-brand-600" />
                <span className="font-medium">Order History</span>
              </CardContent>
            </Card>
          </Link>

          {profile?.role === "admin" && (
            <Link href="/admin">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-600 text-[10px] font-bold text-white">
                    A
                  </span>
                  <span className="font-medium">Admin Dashboard</span>
                </CardContent>
              </Card>
            </Link>
          )}

          <Button
            variant="outline"
            className="mt-4 w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
