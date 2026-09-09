import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, PlayCircle, ChevronRight } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function SubjectLearnPage({
  params,
}: {
  params: Promise<{ slug: string; subjectId: string }>;
}) {
  const { slug, subjectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/courses/${slug}/learn/subject/${subjectId}`);
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

  const { data: subject } = await supabase
    .from("subjects")
    .select("id, title")
    .eq("id", subjectId)
    .single();

  if (!subject) notFound();

  const { data: chapters } = await supabase
    .from("chapters")
    .select(`
      id,
      title,
      sort_order,
      lessons (
        id,
        title,
        published,
        youtube_video_id,
        duration_minutes,
        sort_order
      )
    `)
    .eq("subject_id", subjectId)
    .order("sort_order", { ascending: true });

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link
          href={`/courses/${slug}/learn`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All subjects
        </Link>

        <h1 className="mb-6 text-xl font-bold text-gray-900">{subject.title}</h1>

        {!chapters || chapters.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-gray-500">
              No chapters yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {chapters.map((chapter: any) => {
              const publishedLessons = (chapter.lessons || [])
                .filter((l: any) => l.published)
                .sort((a: any, b: any) => a.sort_order - b.sort_order);

              return (
                <div key={chapter.id}>
                  <h2 className="mb-2 text-sm font-semibold text-gray-700">
                    {chapter.title}
                  </h2>
                  {publishedLessons.length === 0 ? (
                    <p className="mb-3 text-xs text-gray-400">No classes yet</p>
                  ) : (
                    <div className="space-y-1.5">
                      {publishedLessons.map((lesson: any) => (
                        <Link
                          key={lesson.id}
                          href={`/courses/${slug}/learn/${lesson.id}`}
                        >
                          <Card className="transition-shadow hover:shadow-sm">
                            <CardContent className="flex items-center gap-3 p-3">
                              <PlayCircle className="h-5 w-5 shrink-0 text-brand-600" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {lesson.title}
                                </p>
                                {lesson.duration_minutes && (
                                  <p className="text-xs text-gray-500">
                                    {lesson.duration_minutes} min
                                  </p>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
