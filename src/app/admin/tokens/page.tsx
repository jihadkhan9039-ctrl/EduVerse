import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateToken } from "@/lib/utils";

async function createToken(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const courseId = String(formData.get("course_id"));
  if (!courseId) return;
  await supabase.from("access_tokens").insert({
    course_id: courseId,
    token: generateToken(10),
    usage_limit: Number(formData.get("usage_limit") ?? 1),
    status: "active",
    created_by: user?.id,
  });
  revalidatePath("/admin/tokens");
}

export default async function AdminTokensPage() {
  const supabase = await createClient();
  const [{ data: tokens }, { data: courses }] = await Promise.all([
    supabase.from("access_tokens").select("*, course:courses(title)").order("created_at", { ascending: false }).limit(50),
    supabase.from("courses").select("id, title").order("title"),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Access Tokens</h1>
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Generate token</CardTitle></CardHeader>
        <CardContent>
          <form action={createToken} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Course</label>
              <Select name="course_id" required>
                <option value="">Select course</option>
                {(courses ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Usage limit</label>
              <Input name="usage_limit" type="number" min="1" defaultValue="1" />
            </div>
            <Button type="submit" className="w-full">Generate Token</Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {(tokens ?? []).map((t: any) => (
          <Card key={t.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-mono text-sm font-bold tracking-wider">{t.token}</p>
                <p className="text-xs text-gray-500">{t.course?.title}</p>
              </div>
              <Badge variant={t.status === "active" ? "success" : "warning"}>{t.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
