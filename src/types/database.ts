export type UserRole = "admin" | "instructor" | "student";

export type CourseStatus = "draft" | "published" | "archived";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type TokenStatus = "active" | "inactive" | "expired" | "used";

export type ReactionType = "like" | "love" | "helpful";

export type CommentStatus = "visible" | "hidden" | "deleted";

export type EnrollmentSource = "purchase" | "token" | "admin" | "free";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  instructor_id: string | null;
  price: number;
  discount_price: number | null;
  status: CourseStatus;
  student_count: number;
  class_count: number;
  created_at: string;
  updated_at: string;
  // joined
  category?: Category | null;
  instructor?: Profile | null;
}

export interface Subject {
  id: string;
  course_id: string;
  title: string;
  thumbnail: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  title: string;
  thumbnail: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  lesson_count?: number;
}

export interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  youtube_video_id: string | null;
  instructor_id: string | null;
  duration_minutes: number | null;
  comments_enabled: boolean;
  reactions_enabled: boolean;
  published: boolean;
  sort_order: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  instructor?: Profile | null;
  resources?: LessonResource[];
}

export interface LessonResource {
  id: string;
  lesson_id: string;
  title: string;
  google_drive_url: string;
  show_resource: boolean;
  allow_download: boolean;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  source: EnrollmentSource;
  created_at: string;
  course?: Course;
}

export interface AccessToken {
  id: string;
  course_id: string;
  token: string;
  usage_limit: number;
  used_count: number;
  used_by: string | null;
  used_at: string | null;
  expires_at: string | null;
  status: TokenStatus;
  created_by: string | null;
  created_at: string;
  course?: Course;
}

export interface Order {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  payment_status: PaymentStatus;
  payment_method: string | null;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
  course?: Course;
}

export interface LessonReaction {
  id: string;
  lesson_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface LessonComment {
  id: string;
  lesson_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
  user?: Profile;
  replies?: LessonComment[];
}

export interface LessonView {
  id: string;
  lesson_id: string;
  user_id: string;
  last_viewed_at: string;
}
