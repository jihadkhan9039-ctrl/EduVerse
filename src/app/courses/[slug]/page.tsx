import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users, PlayCircle, MessageCircle } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select(
      `
      *,
      category:categories(name),
      instructor:profiles!courses_instructor_id_fkey(full_name)
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!course) notFound();

  // Count real lessons
  const { count: lessonCount } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("published", true)
    .in(
      "chapter_id",
      (
        await supabase
          .from("chapters")
          .select("id")
          .in(
            "subject_id",
            (
              await supabase
                .from("subjects")
                .select("id")
                .eq("course_id", course.id)
            ).data?.map((s) => s.id) ?? []
          )
      ).data?.map((c) => c.id) ?? []
    );

  // Check if current user is enrolled
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    isEnrolled = !!enrollment;
  }

  // Telegram username from env or hardcoded for now
  const telegramUsername = process.env.NEXT_PUBLIC_TELEGRAM_USERNAME || "your_telegram";

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link
          href="/courses"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Courses
        </Link>

        {/* Thumbnail */}
        <div className="mb-5 aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
          {course.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <PlayCircle className="h-16 w-16 text-brand-400/60" />
          )}
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">{course.title}</h1>

        <p className="mb-3 text-sm text-gray-500">
          by {(course.instructor as any)?.full_name || "EduVerse"}
          {course.category && (
            <>
              {" · "}
              <Badge variant="secondary">{(course.category as any).name}</Badge>
            </>
          )}
        </p>

        <div className="mb-5 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {course.student_count || 0} students
          </span>
          <span className="flex items-center gap-1">
            <PlayCircle className="h-4 w-4" />
            {lessonCount ?? course.class_count ?? 0} classes
          </span>
        </div>

        {course.description && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">About this course</h2>
              <p className="whitespace-pre-wrap text-sm text-gray-600">
                {course.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Price + Actions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="mb-4 flex items-baseline gap-2">
              {course.discount_price ? (
                <>
                  <span className="text-2xl font-bold text-brand-600">
                    {formatPrice(Number(course.discount_price))}
                  </span>
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(Number(course.price))}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-brand-600">
                  {formatPrice(Number(course.price))}
                </span>
              )}
            </div>

            {isEnrolled ? (
              <Link href={`/courses/${slug}/learn`}>
                <Button className="w-full" size="lg">
                  Continue Learning
                </Button>
              </Link>
            ) : (
              <div className="space-y-3">
                {/* Telegram Buy Option */}
                <a
                  href={`https://t.me/${telegramUsername.replace("@", "")}?text=${encodeURIComponent(
                    `Hi, I want to buy the course: ${course.title}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full" size="lg">
                    <MessageCircle className="h-5 w-5" />
                    Buy via Telegram
                  </Button>
                </a>

                <p className="text-center text-xs text-gray-500">
                  টাকা পাঠিয়ে টোকেন নিয়ে কোর্স আনলক করুন
                </p>

                {/* Enter Access Token */}
                <Link href={`/courses/${slug}/redeem`}>
                  <Button variant="outline" className="w-full">
                    Enter Access Token
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <MobileNav />
    </div>
  );
}
