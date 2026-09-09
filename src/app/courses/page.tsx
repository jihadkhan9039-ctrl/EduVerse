import Link from "next/link";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      slug,
      price,
      discount_price,
      student_count,
      class_count,
      thumbnail,
      instructor:profiles!courses_instructor_id_fkey(full_name)
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <Header title="Courses" />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">All Courses</h1>

        {!courses || courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <PlayCircle className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">No published courses yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden transition-shadow hover:shadow-md"
              >
                <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                  {course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PlayCircle className="h-12 w-12 text-brand-500/60" />
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-1 line-clamp-2 font-semibold text-gray-900">
                    {course.title}
                  </h3>
                  <p className="mb-3 text-sm text-gray-500">
                    by {(course.instructor as any)?.full_name || "EduVerse"}
                  </p>
                  <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course.student_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-3.5 w-3.5" />
                      {course.class_count || 0} classes
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      {course.discount_price ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold text-brand-600">
                            {formatPrice(Number(course.discount_price))}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(Number(course.price))}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-brand-600">
                          {formatPrice(Number(course.price))}
                        </span>
                      )}
                    </div>
                    <Link href={`/courses/${course.slug}`}>
                      <Button size="sm">View Course</Button>
                    </Link>
                  </div>
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
