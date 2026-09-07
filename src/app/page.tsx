import Link from "next/link";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, PlayCircle, ArrowRight } from "lucide-react";

// Demo data – replace with real Supabase queries later
const featuredCourses = [
  {
    id: "1",
    title: "HSC 2027 Full Course",
    instructor: "Kazi Rakibul Hasan",
    students: 12500,
    classes: 180,
    price: 4500,
    discountPrice: 2999,
    thumbnail: null,
    enrolled: false,
  },
  {
    id: "2",
    title: "SSC 2026 Complete Package",
    instructor: "Nusrat Jahan",
    students: 8400,
    classes: 120,
    price: 3500,
    discountPrice: 2499,
    thumbnail: null,
    enrolled: true,
  },
  {
    id: "3",
    title: "University Admission 2026",
    instructor: "Dr. Arif Hossain",
    students: 6200,
    classes: 95,
    price: 5500,
    discountPrice: null,
    thumbnail: null,
    enrolled: false,
  },
];

const categories = [
  { name: "Academic", slug: "academic", count: 24 },
  { name: "Admission", slug: "admission", count: 18 },
  { name: "HSC 2027", slug: "hsc-2027", count: 12 },
  { name: "SSC 2026", slug: "ssc-2026", count: 10 },
  { name: "Engineering", slug: "engineering", count: 8 },
  { name: "Medical", slug: "medical", count: 7 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <Header userName="Student" />

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Hero */}
        <section className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-lg sm:p-8">
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
            Learn Today, Lead Tomorrow
          </h1>
          <p className="mb-6 max-w-md text-brand-100">
            Premium academic & admission courses designed for Bangladeshi
            students.
          </p>
          <Link href="/courses">
            <Button
              variant="secondary"
              className="bg-white text-brand-700 hover:bg-brand-50"
            >
              Explore Courses
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </section>

        {/* Categories */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
            <Link
              href="/courses"
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/courses?category=${cat.slug}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col items-center p-4 text-center">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {cat.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {cat.count} courses
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Courses */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Featured Courses
            </h2>
            <Link
              href="/courses"
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
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
                      <Link href={`/courses/${course.id}`}>
                        <Button size="sm">View Course</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Live Classes placeholder */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Live Classes
          </h2>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <PlayCircle className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">
                No live classes scheduled right now.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
