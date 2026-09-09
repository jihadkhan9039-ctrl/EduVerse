import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/profile/orders");
  }

  // Enrollments as "orders" (token / manual purchase)
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      source,
      created_at,
      course:courses(id, title, slug, price, discount_price, thumbnail)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <Header />
      <main className="mx-auto max-w-lg px-4 py-6">
        <Link
          href="/profile"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to profile
        </Link>

        <h1 className="mb-6 text-2xl font-bold text-gray-900">Order History</h1>

        {!enrollments || enrollments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <ShoppingBag className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">No orders yet.</p>
              <Link
                href="/courses"
                className="mt-3 text-sm font-medium text-brand-600 hover:underline"
              >
                Browse courses
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {enrollments.map((item: any) => {
              const course = item.course;
              if (!course) return null;
              const price = course.discount_price ?? course.price;
              return (
                <Link key={item.id} href={`/courses/${course.slug}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">
                          {course.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString("bn-BD", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {" · "}
                          {formatPrice(Number(price))}
                        </p>
                      </div>
                      <Badge variant="success">
                        {item.source === "token" ? "Token" : "Enrolled"}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
