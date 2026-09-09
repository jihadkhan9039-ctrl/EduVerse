"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function RedeemTokenPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=/courses/${slug}/redeem`);
      return;
    }

    // Find the course
    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!course) {
      setError("Course not found");
      setLoading(false);
      return;
    }

    // Find valid token
    const { data: accessToken, error: tokenError } = await supabase
      .from("access_tokens")
      .select("*")
      .eq("token", token.trim().toUpperCase())
      .eq("course_id", course.id)
      .eq("status", "active")
      .maybeSingle();

    if (tokenError || !accessToken) {
      setError("Invalid or already used token");
      setLoading(false);
      return;
    }

    if (accessToken.used_count >= accessToken.usage_limit) {
      setError("This token has reached its usage limit");
      setLoading(false);
      return;
    }

    if (accessToken.expires_at && new Date(accessToken.expires_at) < new Date()) {
      setError("This token has expired");
      setLoading(false);
      return;
    }

    // Create enrollment
    const { error: enrollError } = await supabase.from("enrollments").insert({
      user_id: user.id,
      course_id: course.id,
      source: "token",
    });

    if (enrollError) {
      if (enrollError.code === "23505") {
        setError("You are already enrolled in this course");
      } else {
        setError(enrollError.message);
      }
      setLoading(false);
      return;
    }

    // Mark token as used
    await supabase
      .from("access_tokens")
      .update({
        used_count: accessToken.used_count + 1,
        used_by: user.id,
        used_at: new Date().toISOString(),
        status: accessToken.used_count + 1 >= accessToken.usage_limit ? "used" : "active",
      })
      .eq("id", accessToken.id);

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push(`/courses/${slug}`);
      router.refresh();
    }, 1500);
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <Header />
      <main className="mx-auto max-w-md px-4 py-6">
        <Link
          href={`/courses/${slug}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to course
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Enter Access Token</CardTitle>
            <p className="text-sm text-gray-500">
              Telegram-এ টাকা পাঠানোর পর যে টোকেন পেয়েছ সেটা এখানে লিখো
            </p>
          </CardHeader>
          <CardContent>
            {success ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
                Success! Course unlocked. Redirecting...
              </p>
            ) : (
              <form onSubmit={handleRedeem} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Access Token
                  </label>
                  <Input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="e.g. ABC123XYZ"
                    required
                    className="uppercase tracking-wider"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Checking..." : "Unlock Course"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <MobileNav />
    </div>
  );
}
