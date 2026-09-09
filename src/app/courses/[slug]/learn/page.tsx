import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, PlayCircle, ChevronRight, Lock } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/courses/${slug}/learn`);
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

  // Get subjects with chapters and lessons
  const { data: subjects } = await supabase
    .from("subjects")
    .select(`
      id,
      title,
      sort_order,
      chapters (
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
      )
    `)
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link
          href={`/courses/${slug}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to course
        </Link>

        <h1 className="mb-6 text-xl font-bold text-gray-900">{course.title}</h1>

        {!subjects || subjects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-gray-500">
              No content available yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {subjects.map((subject: any) => (
              <div key={subject.id}>
                <h2 className="mb-3 text-base font-semibold text-gray-900">
                  {subject.title}
                </h2>
                <div className="space-y-2">
                  {(subject.chapters || [])
                    .sort((a: any, b: any) => a.sort_order - b.sort_order)
                    .map((chapter: any) => (
                      <Card key={chapter.id}>
                        <CardContent className="p-0">
                          <div className="border-b border-gray-100 px-4 py-3">
                            <p className="text-sm font-medium text-gray-800">
                              {chapter.title}
                            </p>
                          </div>
                          <div className="divide-y divide-gray-50">
                            {(chapter.lessons || [])
                              .filter((l: any) => l.published)
                              .sort((a: any, b: any) => a.sort_order - b.sort_order)
                              .map((lesson: any) => (
                                <Link
                                  key={lesson.id}
                                  href={`/courses/${slug}/learn/${lesson.id}`}
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                                >
                                  {lesson.youtube_video_id ? (
                                    <PlayCircle className="h-5 w-5 shrink-0 text-brand-600" />
                                  ) : (
                                    <Lock className="h-5 w-5 shrink-0 text-gray-300" />
                                  )}
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
                                </Link>
                              ))}
                            {(chapter.lessons || []).filter((l: any) => l.published).length === 0 && (
                              <p className="px-4 py-3 text-xs text-gray-400">
                                No published lessons
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
