"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify, extractYouTubeId } from "@/lib/utils";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "admin" && profile.role !== "instructor")) {
    throw new Error("Not authorized");
  }
  return { supabase, user };
}

export async function createCourse(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title required");
  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
  const { data, error } = await supabase.from("courses").insert({
    title,
    slug,
    category_id: String(formData.get("category_id") ?? "") || null,
    description: String(formData.get("description") ?? "").trim() || null,
    price: Number(formData.get("price") ?? 0),
    discount_price: formData.get("discount_price") ? Number(formData.get("discount_price")) : null,
    instructor_id: user.id,
    status: "draft",
  }).select("id").single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${data.id}`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("courses").update({
    title: String(formData.get("title") ?? "").trim(),
    category_id: String(formData.get("category_id") ?? "") || null,
    description: String(formData.get("description") ?? "").trim() || null,
    price: Number(formData.get("price") ?? 0),
    discount_price: formData.get("discount_price") ? Number(formData.get("discount_price")) : null,
    status: String(formData.get("status") ?? "draft"),
    thumbnail: String(formData.get("thumbnail") ?? "").trim() || null,
  }).eq("id", courseId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/");
  revalidatePath("/courses");
}

export async function deleteCourse(courseId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("courses").delete().eq("id", courseId);
  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

export async function createSubject(courseId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title required");
  await supabase.from("subjects").insert({
    course_id: courseId,
    title,
    sort_order: Number(formData.get("sort_order") ?? 0),
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteSubject(subjectId: string, courseId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("subjects").delete().eq("id", subjectId);
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function createChapter(subjectId: string, courseId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title required");
  await supabase.from("chapters").insert({
    subject_id: subjectId,
    title,
    sort_order: Number(formData.get("sort_order") ?? 0),
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function createLesson(chapterId: string, subjectId: string, courseId: string, formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title required");
  const yt = String(formData.get("youtube_video_id") ?? "").trim();
  await supabase.from("lessons").insert({
    chapter_id: chapterId,
    title,
    description: String(formData.get("description") ?? "").trim() || null,
    youtube_video_id: yt ? extractYouTubeId(yt) : null,
    duration_minutes: formData.get("duration_minutes") ? Number(formData.get("duration_minutes")) : null,
    published: formData.get("published") === "on",
    instructor_id: user.id,
    sort_order: Number(formData.get("sort_order") ?? 0),
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function updateLesson(lessonId: string, chapterId: string, subjectId: string, courseId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const yt = String(formData.get("youtube_video_id") ?? "").trim();
  await supabase.from("lessons").update({
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    youtube_video_id: yt ? extractYouTubeId(yt) : null,
    duration_minutes: formData.get("duration_minutes") ? Number(formData.get("duration_minutes")) : null,
    published: formData.get("published") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0),
  }).eq("id", lessonId);
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteLesson(lessonId: string, chapterId: string, subjectId: string, courseId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("lessons").delete().eq("id", lessonId);
  revalidatePath(`/admin/courses/${courseId}`);
}
