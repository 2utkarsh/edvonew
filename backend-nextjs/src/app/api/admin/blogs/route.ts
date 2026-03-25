import { normalizeBlogCategories } from '@/lib/blog-categories';
import { getFallbackAdminBlogs } from '@/lib/content-fallback';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { created, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { BlogModel } from '@/models/Blog';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { UserModel } from '@/models/User';
import { mapBlogDocumentToPublicBlog } from '@/lib/blog-data';

export async function GET(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  if (!hasConfiguredMongoUri()) {
    return toResponse(ok(getFallbackAdminBlogs()));
  }

  await connectToDatabase();
  await ensureSeededContent();

  const items = await BlogModel.find().populate('author', 'name').sort({ order: 1, updatedAt: -1 }).lean();
  return toResponse(ok(items.map((item) => ({ ...mapBlogDocumentToPublicBlog(item), status: item.status || 'draft', order: item.order || 0 }))));
}

export async function POST(request: Request) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const title = String(body.title || 'Untitled Blog');
  const categories = normalizeBlogCategories(body.categories ?? body.category);
  const primaryCategory = categories[0] || 'General';
  const tags = categories.length ? categories : [primaryCategory];
  const authorName = String(body.author || 'EDVO Team');
  const authorEmail = `${authorName.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '')}@edvo.local`;

  const author = await UserModel.findOneAndUpdate(
    { email: authorEmail },
    {
      $set: {
        name: authorName,
        email: authorEmail,
        role: 'instructor',
        isActive: true,
        passwordHash: 'demo-admin',
      },
      $setOnInsert: {
        socialLinks: [],
        skills: [],
        enrolledCourses: [],
        enrolledExams: [],
        createdCourses: [],
        createdExams: [],
      },
    },
    { upsert: true, new: true }
  );

  const item = await BlogModel.create({
    title,
    slug: String(body.slug || slugify(title)),
    content: String(body.content || body.description || 'New blog content'),
    excerpt: String(body.description || 'New blog description'),
    featuredImage: String(body.thumbnail || '/images/edvo-official-logo-v10.png'),
    category: primaryCategory,
    categories: tags,
    tags,
    author: author._id,
    status: body.status === 'draft' || body.status === 'archived' ? body.status : 'published',
    order: parseInt(String(body.order || 0), 10) || 0,
    readTime: parseInt(String(body.readTime || 5), 10) || 5,
    publishedAt: new Date(),
  });

  const createdItem = await BlogModel.findById(item._id).populate('author', 'name').lean();
  return toResponse(created({ ...mapBlogDocumentToPublicBlog(createdItem), status: createdItem?.status || 'published', order: createdItem?.order || 0 }));
}
