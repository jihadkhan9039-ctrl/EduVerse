import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function createChapter(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const subjectId = String(formData.get("subject_id"));
  const courseId = String(formData.get("course_id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await supabase.from("chapters").insert({
    subject_id: subjectId,
    title,
    sort_order: Number(formData.get("sort_order") ?? 0),
  });
  revalidatePath(`/admin/courses/${courseId}/subjects/${subjectId}`);
}

async function deleteChapter(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const chapterId = String(formData.get("chapter_id"));
  const subjectId = String(formData.get("subject_id"));
  const courseId = String(formData.get("course_id"));
  await supabase.from("chapters").delete().eq("id", chapterId);
  revalidatePath(`/admin/courses/${courseId}/subjects/${subjectId}`);
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ courseId: string; subjectId: string }>;
}) {
  const { courseId, subjectId } = await params;
  const supabase = await createClient();

  const [{ data: subject }, { data: chapters }] = await Promise.all([
    supabase.from("subjects").select("*").eq("id", subjectId).single(),
    supabase
      .from("chapters")
      .select("id, title, sort_order")
      .eq("subject_id", subjectId)
      .order("sort_order"),
  ]);

  if (!subject) notFound();

  return (
    <div className="mx-auto max-w-2xl pb-20">
      <Link
        href={`/admin/courses/${courseId}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to course
      </Link>
      <h1 className="mb-6 text-2xl font-bold">{subject.title}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chapters</CardTitle>
        </CardHeader>
        <CardContent>
          {chapters && chapters.length > 0 && (
            <div className="mb-4 space-y-2">
              {chapters.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between gap-2 rounded-xl border p-3"
                >
                  <Link
                    href={`/admin/courses/${courseId}/subjects/${subjectId}/chapters/${ch.id}`}
                    className="flex flex-1 items-center justify-between gap-2 text-sm font-medium text-gray-900"
                  >
                    {ch.title}
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                  <form action={deleteChapter}>
                    <input type="hidden" name="chapter_id" value={ch.id} />
                    <input type="hidden" name="subject_id" value={subjectId} />
                    <input type="hidden" name="course_id" value={courseId} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                    >
                      Delete
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
          <form action={createChapter} className="flex items-end gap-2 border-t pt-4">
            <input type="hidden" name="subject_id" value={subjectId} />
            <input type="hidden" name="course_id" value={courseId} />
            <input type="hidden" name="sort_order" value={chapters?.length ?? 0} />
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium">
                New chapter
              </label>
              <Input name="title" placeholder="e.g. গতিবিদ্যা" required />
            </div>
            <Button type="submit">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
