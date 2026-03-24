export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  avatar?: string;
  bio?: string;
  enrolledCourses?: string[];
  createdCourses?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructorId: string;
  instructorName: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  studentsEnrolled: number;
  duration: string;
  lectures: number;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  tags: string[];
  whatYouWillLearn: string[];
  requirements: string[];
  curriculum: CourseModule[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseModule {
  id: string;
  title: string;
  duration: string;
  lectures: CourseLecture[];
}

export interface CourseLecture {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  isFree: boolean;
  completed: boolean;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  mode?: "remote" | "onsite" | "hybrid";
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  postedDate: Date;
  applicationDeadline?: Date;
  applicants: number;
  applyUrl: string;
}

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  helpful: number;
  createdAt: Date;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedLectures: string[];
  enrolledAt: Date;
  lastAccessedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  courseCount: number;
  color: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
