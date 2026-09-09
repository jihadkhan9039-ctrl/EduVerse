import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createCourse } from "../actions";

export default async function NewCoursePage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, name").order("sort_order");

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold">New Course</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Course details</CardTitle></CardHeader>
        <CardContent>
          <form action={createCourse} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Title</label>
              <Input name="title" required placeholder="e.g. HSC 2027 Physics" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Category</label>
              <Select name="category_id">
                <option value="">No category</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Description</label>
              <Textarea name="description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Price (৳)</label>
                <Input name="price" type="number" min="0" defaultValue="0" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Discount (৳)</label>
                <Input name="discount_price" type="number" min="0" placeholder="optional" />
              </div>
            </div>
            <Button type="submit" className="w-full">Create Course</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
