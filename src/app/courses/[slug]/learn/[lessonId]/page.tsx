import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { LessonComments } from "@/components/lesson-comments";

export default async function LessonPlayerPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/courses/${slug}/learn/${lessonId}`);
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", slug)
    .single();

  if (!course) notFound();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  if (!enrollment) {
    redirect(`/courses/${slug}`);
  }

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, instructor:profiles!lessons_instructor_id_fkey(full_name)")
    .eq("id", lessonId)
    .eq("published", true)
    .single();

  if (!lesson) notFound();

  // Track view
  await supabase.from("lesson_views").upsert(
    {
      lesson_id: lessonId,
      user_id: user.id,
      last_viewed_at: new Date().toISOString(),
    },
    { onConflict: "lesson_id,user_id" }
  );

  // View count
  const { count: viewCount } = await supabase
    .from("lesson_views")
    .select("*", { count: "exact", head: true })
    .eq("lesson_id", lessonId);

  // Comments
  const { data: comments } = await supabase
    .from("lesson_comments")
    .select("*, user:profiles!lesson_comments_user_id_fkey(full_name)")
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: false })
    .limit(50);

  // youtube-nocookie + controls=0 + modestbranding + disablekb to reduce link exposure
  const embedUrl = lesson.youtube_video_id
    ? `https://www.youtube-nocookie.com/embed/${lesson.youtube_video_id}?rel=0&modestbranding=1&controls=1&disablekb=1&fs=1&iv_load_policy=3`
    : null;

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-4">
        <Link
          href={`/courses/${slug}/learn`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All subjects
        </Link>

        <h1 className="mb-1 text-lg font-bold text-gray-900">{lesson.title}</h1>
        <div className="mb-4 flex items-center gap-3 text-sm text-gray-500">
          <span>by {(lesson.instructor as any)?.full_name || "Instructor"}</span>
          {lesson.duration_minutes && <span>· {lesson.duration_minutes} min</span>}
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {viewCount ?? 0} views
          </span>
        </div>

        {/* Video — no visible YouTube link */}
        {embedUrl ? (
          <div className="relative mb-5 aspect-video overflow-hidden rounded-2xl bg-black">
            <iframe
              src={embedUrl}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
              referrerPolicy="no-referrer"
            />
            {/* Overlay to discourage right-click / easy link copy */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "transparent" }}
            />
          </div>
        ) : (
          <Card className="mb-5">
            <CardContent className="flex aspect-video items-center justify-center text-sm text-gray-500">
              No video available
            </CardContent>
          </Card>
        )}

        {lesson.description && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <p className="whitespace-pre-wrap text-sm text-gray-600">
                {lesson.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        <LessonComments
          lessonId={lessonId}
          initialComments={(comments ?? []).map((c: any) => ({
            id: c.id,
            content: c.content,
            created_at: c.created_at,
            user_name: c.user?.full_name || "Student",
            user_id: c.user_id,
          }))}
          currentUserId={user.id}
        />
      </main>
      <MobileNav />
    </div>
  );
}
