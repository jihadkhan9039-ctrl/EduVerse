import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Bell } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/notifications");
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  // Mark all as read
  if (notifications && notifications.length > 0) {
    const rows = notifications.map((n) => ({
      notification_id: n.id,
      user_id: user.id,
    }));
    await supabase.from("notification_reads").upsert(rows, {
      onConflict: "notification_id,user_id",
      ignoreDuplicates: true,
    });
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <Header />
      <main className="mx-auto max-w-lg px-4 py-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        <h1 className="mb-6 text-2xl font-bold text-gray-900">Notifications</h1>

        {!notifications || notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <Bell className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">No notifications yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Card key={n.id}>
                <CardContent className="p-4">
                  <p className="font-medium text-gray-900">{n.title}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                    {n.body}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleString("bn-BD", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
