import Link from "next/link";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, PlayCircle } from "lucide-react";

// Demo data – will be replaced with Supabase queries
const courses = [
  {
    id: "1",
    slug: "hsc-2027-full-course",
    title: "HSC 2027 Full Course",
    instructor: "Kazi Rakibul Hasan",
    students: 12500,
    classes: 180,
    price: 4500,
    discountPrice: 2999,
    enrolled: false,
  },
  {
    id: "2",
    slug: "ssc-2026-complete",
    title: "SSC 2026 Complete Package",
    instructor: "Nusrat Jahan",
    students: 8400,
    classes: 120,
    price: 3500,
    discountPrice: 2499,
    enrolled: true,
  },
  {
    id: "3",
    slug: "university-admission-2026",
    title: "University Admission 2026",
    instructor: "Dr. Arif Hossain",
    students: 6200,
    classes: 95,
    price: 5500,
    discountPrice: null,
    enrolled: false,
  },
  {
    id: "4",
    slug: "engineering-admission",
    title: "Engineering Admission Crash Course",
    instructor: "Engr. Rafiqul Islam",
    students: 4100,
    classes: 60,
    price: 4000,
    discountPrice: 3200,
    enrolled: false,
  },
];

export default function CoursesPage() {
  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <Header title="Courses" />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">All Courses</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden transition-shadow hover:shadow-md"
            >
              <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                <PlayCircle className="h-12 w-12 text-brand-500/60" />
              </div>
              <CardContent className="p-4">
                <h3 className="mb-1 line-clamp-2 font-semibold text-gray-900">
                  {course.title}
                </h3>
                <p className="mb-3 text-sm text-gray-500">
                  by {course.instructor}
                </p>
                <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {course.students.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <PlayCircle className="h-3.5 w-3.5" />
                    {course.classes} classes
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    {course.discountPrice ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-brand-600">
                          ৳{course.discountPrice}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          ৳{course.price}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-brand-600">
                        ৳{course.price}
                      </span>
                    )}
                  </div>
                  {course.enrolled ? (
                    <Button size="sm" variant="success">
                      Enrolled
                    </Button>
                  ) : (
                    <Link href={`/courses/${course.slug}`}>
                      <Button size="sm">View Course</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
