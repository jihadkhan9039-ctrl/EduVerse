import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

async function createCategory(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await supabase.from("categories").insert({
    name,
    slug: slugify(name),
    sort_order: Number(formData.get("sort_order") ?? 0),
  });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Categories</h1>
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Add category</CardTitle></CardHeader>
        <CardContent>
          <form action={createCategory} className="flex gap-2">
            <Input name="name" placeholder="e.g. HSC 2027" required className="flex-1" />
            <input type="hidden" name="sort_order" value={categories?.length ?? 0} />
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {(categories ?? []).map((cat) => (
          <Card key={cat.id}>
            <CardContent className="flex items-center justify-between p-4">
              <span className="font-medium">{cat.name}</span>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={cat.id} />
                <Button type="submit" variant="ghost" size="sm" className="text-red-600">Delete</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
