import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { updateCourse, createSubject, deleteSubject } from "../actions";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  const [{ data: course }, { data: categories }, { data: subjects }] = await Promise.all([
    supabase.from("courses").select("*").eq("id", courseId).single(),
    supabase.from("categories").select("id, name").order("sort_order"),
    supabase.from("subjects").select("id, title, sort_order").eq("course_id", courseId).order("sort_order"),
  ]);

  if (!course) notFound();

  const updateWithId = updateCourse.bind(null, courseId);
  const createSubjectWithId = createSubject.bind(null, courseId);

  return (
    <div className="mx-auto max-w-2xl pb-20">
      <h1 className="mb-1 text-2xl font-bold">{course.title}</h1>
      <p className="mb-6 text-sm text-gray-500">Edit course</p>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Course details</CardTitle></CardHeader>
        <CardContent>
          <form action={updateWithId} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Title</label>
              <Input name="title" defaultValue={course.title} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Category</label>
                <Select name="category_id" defaultValue={course.category_id ?? ""}>
                  <option value="">No category</option>
                  {(categories ?? []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Status</label>
                <Select name="status" defaultValue={course.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Thumbnail URL</label>
              <Input name="thumbnail" defaultValue={course.thumbnail ?? ""} placeholder="https://..." />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Description</label>
              <Textarea name="description" defaultValue={course.description ?? ""} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Price (৳)</label>
                <Input name="price" type="number" min="0" defaultValue={course.price} required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Discount (৳)</label>
                <Input name="discount_price" type="number" min="0" defaultValue={course.discount_price ?? ""} />
              </div>
            </div>
            <Button type="submit" className="w-full">Save changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Subjects</CardTitle></CardHeader>
        <CardContent>
          {subjects && subjects.length > 0 && (
            <div className="mb-4 space-y-2">
              {subjects.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border p-3">
                  <span className="text-sm font-medium">{s.title}</span>
                  <form action={deleteSubject.bind(null, s.id, courseId)}>
                    <Button type="submit" variant="ghost" size="sm" className="text-red-600">Delete</Button>
                  </form>
                </div>
              ))}
            </div>
          )}
          <form action={createSubjectWithId} className="flex items-end gap-2 border-t pt-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium">New subject</label>
              <Input name="title" placeholder="e.g. Physics" required />
            </div>
            <input type="hidden" name="sort_order" value={subjects?.length ?? 0} />
            <Button type="submit"><Plus className="h-4 w-4" /> Add</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
