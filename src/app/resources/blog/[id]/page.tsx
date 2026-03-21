import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { getBlogById, MOCK_BLOGS } from '../data';

interface BlogDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return MOCK_BLOGS.map((blog) => ({ id: blog.id }));
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = await params;
  const blog = getBlogById(id);

  if (!blog) {
    notFound();
  }

  const relatedBlogs = MOCK_BLOGS.filter((item) => item.id !== blog.id && item.category === blog.category).slice(0, 3);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pt-12 pb-24 transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link href="/resources/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
          <ArrowLeft className="h-4 w-4" />
          Back to all articles
        </Link>

        <article className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative h-[320px] w-full overflow-hidden sm:h-[420px]">
            <img src={blog.thumbnail} alt={blog.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10">
              <Badge variant="gradient" className="mb-4 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest">{blog.category}</Badge>
              <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">{blog.title}</h1>
            </div>
          </div>

          <div className="grid gap-10 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <p className="mb-8 text-lg leading-8 text-slate-600 dark:text-slate-300">{blog.description}</p>

              <div className="space-y-6 text-base leading-8 text-slate-700 dark:text-slate-300">
                {blog.content.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <aside className="space-y-4 rounded-[1.75rem] border border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/60">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Article details</h2>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <Calendar className="h-4 w-4 text-primary-500" />
                  <span>{blog.date}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <Clock className="h-4 w-4 text-primary-500" />
                  <span>{blog.readTime}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <User className="h-4 w-4 text-primary-500" />
                  <span>{blog.author}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
                <p className="mb-2 text-sm font-black text-slate-900 dark:text-white">Keep learning</p>
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">Explore more EDVO resource articles to keep building your AI, software, and data skills.</p>
                <Link href="/resources/blog" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400">
                  Browse all blogs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </article>

        {relatedBlogs.length > 0 ? (
          <section className="mt-16">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Related reads</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">More in {blog.category}</h2>
              </div>
              <Link href="/resources/blog" className="text-sm font-bold text-primary-600 dark:text-primary-400">See all articles</Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedBlogs.map((related) => (
                <Link key={related.id} href={`/resources/blog/${related.id}`} className="group overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="h-48 overflow-hidden">
                    <img src={related.thumbnail} alt={related.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <p className="mb-2 text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">{related.category}</p>
                    <h3 className="mb-3 text-xl font-black text-slate-900 dark:text-white">{related.title}</h3>
                    <p className="line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{related.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

