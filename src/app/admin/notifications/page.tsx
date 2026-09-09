import { revalidatePath } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

async function sendNotification(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return;

  await supabase.from("notifications").insert({
    title,
    body,
    created_by: user.id,
  });

  revalidatePath("/admin/notifications");
  revalidatePath("/notifications");
}

async function deleteNotification(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = String(formData.get("id"));
  await supabase.from("notifications").delete().eq("id", id);
  revalidatePath("/admin/notifications");
  revalidatePath("/notifications");
}

export default async function AdminNotificationsPage() {
  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Notifications</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Send to all users</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={sendNotification} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Title</label>
              <Input name="title" placeholder="e.g. New class uploaded" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Message</label>
              <Textarea
                name="body"
                placeholder="Write the notification message..."
                required
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full">
              Send Notification
            </Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-gray-700">Sent history</h2>
      <div className="space-y-2">
        {(notifications ?? []).length === 0 && (
          <p className="text-sm text-gray-500">No notifications sent yet.</p>
        )}
        {(notifications ?? []).map((n) => (
          <Card key={n.id}>
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-gray-900">{n.title}</p>
                <p className="mt-1 text-sm text-gray-600">{n.body}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(n.created_at).toLocaleString("bn-BD")}
                </p>
              </div>
              <form action={deleteNotification}>
                <input type="hidden" name="id" value={n.id} />
                <Button type="submit" variant="ghost" size="sm" className="text-red-600">
                  Delete
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
