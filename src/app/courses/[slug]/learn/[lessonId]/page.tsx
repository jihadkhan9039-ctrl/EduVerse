import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

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

  // Check enrollment
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

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-4">
        <Link
          href={`/courses/${slug}/learn`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All lessons
        </Link>

        <h1 className="mb-4 text-lg font-bold text-gray-900">{lesson.title}</h1>

        {/* Video Player */}
        {lesson.youtube_video_id ? (
          <div className="mb-5 aspect-video overflow-hidden rounded-2xl bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${lesson.youtube_video_id}?rel=0&modestbranding=1`}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ) : (
          <Card className="mb-5">
            <CardContent className="flex aspect-video items-center justify-center text-sm text-gray-500">
              No video available
            </CardContent>
          </Card>
        )}

        <div className="mb-2 text-sm text-gray-500">
          by {(lesson.instructor as any)?.full_name || "Instructor"}
          {lesson.duration_minutes && ` · ${lesson.duration_minutes} min`}
        </div>

        {lesson.description && (
          <Card>
            <CardContent className="p-4">
              <p className="whitespace-pre-wrap text-sm text-gray-600">
                {lesson.description}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
