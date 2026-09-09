"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_id: string;
};

export function LessonComments({
  lessonId,
  initialComments,
  currentUserId,
}: {
  lessonId: string;
  initialComments: Comment[];
  currentUserId: string;
}) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("lesson_comments")
      .insert({
        lesson_id: lessonId,
        user_id: currentUserId,
        content: text.trim(),
      })
      .select("id, content, created_at, user_id")
      .single();

    if (!error && data) {
      setComments([
        {
          id: data.id,
          content: data.content,
          created_at: data.created_at,
          user_name: "You",
          user_id: data.user_id,
        },
        ...comments,
      ]);
      setText("");
    }
    setLoading(false);
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
          />
          <Button type="submit" size="sm" disabled={loading || !text.trim()}>
            {loading ? "Posting..." : "Post Comment"}
          </Button>
        </form>

        {comments.length === 0 ? (
          <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="rounded-xl bg-gray-50 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {c.user_name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(c.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {c.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
