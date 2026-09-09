import Link from "next/link";
import { BookOpen, Users, Key, FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: courseCount },
    { count: studentCount },
    { count: tokenCount },
    { count: categoryCount },
  ] = await Promise.all([
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("access_tokens").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("categories").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Courses", value: courseCount ?? 0, href: "/admin/courses", icon: BookOpen },
    { label: "Students", value: studentCount ?? 0, href: "/admin/users", icon: Users },
    { label: "Active Tokens", value: tokenCount ?? 0, href: "/admin/tokens", icon: Key },
    { label: "Categories", value: categoryCount ?? 0, href: "/admin/categories", icon: FolderOpen },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
