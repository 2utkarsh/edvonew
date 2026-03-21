export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  thumbnail: string;
  content: string[];
}

export const BLOG_CATEGORIES = [
  { id: 'all', label: 'All Articles' },
  { id: 'Roadmaps', label: 'Roadmaps' },
  { id: 'Data Science', label: 'Data Science' },
  { id: 'AI & ML', label: 'AI & ML' },
  { id: 'Programming', label: 'Coding' },
  { id: 'Career Tips', label: 'Soft Skills' },
] as const;

const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '/backend';

export async function fetchBlogs(): Promise<BlogPost[]> {
  const response = await fetch(`${apiBase}/api/blogs`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || 'Failed to load blogs');
  }

  const blogs = (Array.isArray(payload?.data) ? payload.data : []) as Record<string, unknown>[];
  return blogs.map((blog: Record<string, unknown>) => ({
    id: String(blog.id),
    slug: String(blog.slug || blog.id),
    title: String(blog.title || 'Untitled Blog'),
    description: String(blog.description || ''),
    category: String(blog.category || 'General'),
    author: String(blog.author || 'EDVO Team'),
    date: String(blog.date || 'Recently updated'),
    readTime: String(blog.readTime || '5 min read'),
    thumbnail: String(blog.thumbnail || '/images/edvo-official-logo-v10.png'),
    content: Array.isArray(blog.content) ? blog.content.map((paragraph: unknown) => String(paragraph)) : [],
  }));
}
