import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Users</h1>
      <div className="space-y-2">
        {(users ?? []).map((u) => (
          <Card key={u.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{u.full_name}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
              <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
