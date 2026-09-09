import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, status, price, discount_price, student_count, class_count, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <Link href="/admin/courses/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Course
          </Button>
        </Link>
      </div>

      {!courses || courses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-gray-500">
            No courses yet. Create your first course.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {courses.map((course) => (
            <Link key={course.id} href={`/admin/courses/${course.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-gray-900">{course.title}</p>
                    <p className="text-xs text-gray-500">
                      ৳{course.discount_price ?? course.price} · {course.class_count || 0} classes · {course.student_count || 0} students
                    </p>
                  </div>
                  <Badge variant={course.status === "published" ? "success" : "warning"}>
                    {course.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
