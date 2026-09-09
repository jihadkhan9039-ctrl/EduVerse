import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ChevronRight, BookOpen } from "lucide-react";
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

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  if (!enrollment) {
    redirect(`/courses/${slug}`);
  }

  // Only subjects — no nested chapters/lessons here
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, title, sort_order")
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
              No subjects available yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/courses/${slug}/learn/subject/${subject.id}`}
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <span className="flex-1 font-medium text-gray-900">
                      {subject.title}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
