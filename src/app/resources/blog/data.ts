import { publicFetchJson } from '@/lib/backend-api';

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
  order?: number;
}

export interface BlogCategoryOption {
  id: string;
  label: string;
}

type PublicListResponse<T> = {
  success: boolean;
  data: T[];
};

export async function fetchBlogs(): Promise<BlogPost[]> {
  const payload = await publicFetchJson<PublicListResponse<Record<string, unknown>>>('/api/blogs');
  const blogs = Array.isArray(payload?.data) ? payload.data : [];
  return blogs.map((blog) => ({
    id: String(blog.id),
    slug: String(blog.slug || blog.id),
    title: String(blog.title || 'Untitled Blog'),
    description: String(blog.description || ''),
    category: String(blog.category || 'General'),
    author: String(blog.author || 'EDVO Team'),
    date: String(blog.date || 'Recently updated'),
    readTime: String(blog.readTime || '5 min read'),
    thumbnail: String(blog.thumbnail || '/images/edvo-official-logo-v10.png'),
    content: Array.isArray(blog.content) ? blog.content.map((paragraph) => String(paragraph)) : [],
    order: Number(blog.order || 0),
  }));
}

export async function fetchBlogCategories(): Promise<BlogCategoryOption[]> {
  const payload = await publicFetchJson<PublicListResponse<Record<string, unknown>>>('/api/blog-categories');
  const categories = Array.isArray(payload?.data) ? payload.data : [];
  return [
    { id: 'all', label: 'All Articles' },
    ...categories.map((category) => ({
      id: String(category.name || category.slug || 'General'),
      label: String(category.name || category.slug || 'General'),
    })),
  ];
}
