import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Youtube } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { extractYouTubeId } from "@/lib/utils";

async function createLesson(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const chapterId = String(formData.get("chapter_id"));
  const subjectId = String(formData.get("subject_id"));
  const courseId = String(formData.get("course_id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const yt = String(formData.get("youtube_video_id") ?? "").trim();
  await supabase.from("lessons").insert({
    chapter_id: chapterId,
    title,
    description: String(formData.get("description") ?? "").trim() || null,
    youtube_video_id: yt ? extractYouTubeId(yt) : null,
    duration_minutes: formData.get("duration_minutes")
      ? Number(formData.get("duration_minutes"))
      : null,
    published: formData.get("published") === "on",
    instructor_id: user?.id,
    sort_order: Number(formData.get("sort_order") ?? 0),
  });
  revalidatePath(
    `/admin/courses/${courseId}/subjects/${subjectId}/chapters/${chapterId}`
  );
}

async function updateLesson(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const lessonId = String(formData.get("lesson_id"));
  const chapterId = String(formData.get("chapter_id"));
  const subjectId = String(formData.get("subject_id"));
  const courseId = String(formData.get("course_id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const yt = String(formData.get("youtube_video_id") ?? "").trim();
  await supabase
    .from("lessons")
    .update({
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      youtube_video_id: yt ? extractYouTubeId(yt) : null,
      duration_minutes: formData.get("duration_minutes")
        ? Number(formData.get("duration_minutes"))
        : null,
      published: formData.get("published") === "on",
      sort_order: Number(formData.get("sort_order") ?? 0),
    })
    .eq("id", lessonId);
  revalidatePath(
    `/admin/courses/${courseId}/subjects/${subjectId}/chapters/${chapterId}`
  );
}

async function deleteLesson(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const lessonId = String(formData.get("lesson_id"));
  const chapterId = String(formData.get("chapter_id"));
  const subjectId = String(formData.get("subject_id"));
  const courseId = String(formData.get("course_id"));
  await supabase.from("lessons").delete().eq("id", lessonId);
  revalidatePath(
    `/admin/courses/${courseId}/subjects/${subjectId}/chapters/${chapterId}`
  );
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{
    courseId: string;
    subjectId: string;
    chapterId: string;
  }>;
}) {
  const { courseId, subjectId, chapterId } = await params;
  const supabase = await createClient();

  const [{ data: chapter }, { data: lessons }] = await Promise.all([
    supabase.from("chapters").select("*").eq("id", chapterId).single(),
    supabase
      .from("lessons")
      .select("*")
      .eq("chapter_id", chapterId)
      .order("sort_order"),
  ]);

  if (!chapter) notFound();

  return (
    <div className="mx-auto max-w-2xl pb-20">
      <Link
        href={`/admin/courses/${courseId}/subjects/${subjectId}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to subject
      </Link>
      <h1 className="mb-6 text-2xl font-bold">{chapter.title}</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Lessons / Classes</CardTitle>
        </CardHeader>
        <CardContent>
          {lessons && lessons.length > 0 ? (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <details
                  key={lesson.id}
                  className="rounded-xl border border-gray-100 p-3"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      {lesson.youtube_video_id && (
                        <Youtube className="h-4 w-4 text-red-500" />
                      )}
                      {lesson.title}
                    </span>
                    <Badge
                      variant={lesson.published ? "success" : "warning"}
                    >
                      {lesson.published ? "published" : "hidden"}
                    </Badge>
                  </summary>

                  <form action={updateLesson} className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                    <input type="hidden" name="lesson_id" value={lesson.id} />
                    <input type="hidden" name="chapter_id" value={chapterId} />
                    <input type="hidden" name="subject_id" value={subjectId} />
                    <input type="hidden" name="course_id" value={courseId} />
                    <input type="hidden" name="sort_order" value={lesson.sort_order} />

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">
                        Title
                      </label>
                      <Input name="title" defaultValue={lesson.title} required />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">
                        YouTube URL or Video ID
                      </label>
                      <Input
                        name="youtube_video_id"
                        defaultValue={lesson.youtube_video_id ?? ""}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700">
                        Description
                      </label>
                      <Textarea
                        name="description"
                        defaultValue={lesson.description ?? ""}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700">
                          Duration (min)
                        </label>
                        <Input
                          name="duration_minutes"
                          type="number"
                          min="0"
                          defaultValue={lesson.duration_minutes ?? ""}
                        />
                      </div>
                      <div className="flex items-end pb-2.5">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            name="published"
                            defaultChecked={lesson.published}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          Published
                        </label>
                      </div>
                    </div>
                    <Button type="submit" size="sm">
                      Save
                    </Button>
                  </form>

                  <form action={deleteLesson} className="mt-2 border-t border-gray-100 pt-2">
                    <input type="hidden" name="lesson_id" value={lesson.id} />
                    <input type="hidden" name="chapter_id" value={chapterId} />
                    <input type="hidden" name="subject_id" value={subjectId} />
                    <input type="hidden" name="course_id" value={courseId} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                    >
                      Delete lesson
                    </Button>
                  </form>
                </details>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No lessons yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a lesson</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createLesson} className="space-y-3">
            <input type="hidden" name="chapter_id" value={chapterId} />
            <input type="hidden" name="subject_id" value={subjectId} />
            <input type="hidden" name="course_id" value={courseId} />
            <input type="hidden" name="sort_order" value={lessons?.length ?? 0} />
            <div>
              <label className="mb-1.5 block text-sm font-medium">Title</label>
              <Input
                name="title"
                placeholder="e.g. Physics Marathon Class part 2"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                YouTube URL or Video ID
              </label>
              <Input
                name="youtube_video_id"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Description
              </label>
              <Textarea name="description" placeholder="Optional" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Duration (min)
                </label>
                <Input name="duration_minutes" type="number" min="0" />
              </div>
              <div className="flex items-end pb-2.5">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="published"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Publish immediately
                </label>
              </div>
            </div>
            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4" />
              Add lesson
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
