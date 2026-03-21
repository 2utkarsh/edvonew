import { connectToDatabase } from '@/lib/db';
import { fail, ok, parseJson, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { BlogModel } from '@/models/Blog';
import { ensureSeededContent } from '@/lib/content-seeder';
import { requireAdminOrDemo } from '@/lib/demo-admin';
import { mapBlogDocumentToPublicBlog } from '@/lib/blog-data';
import { UserModel } from '@/models/User';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const item = await BlogModel.findById(id).populate('author', 'name').lean();
  if (!item) return toResponse(fail('Blog not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok({ ...mapBlogDocumentToPublicBlog(item), status: item.status || 'draft' }));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const body = parseJson<Record<string, unknown>>(await request.text()) || {};
  const update: Record<string, unknown> = {};

  if (body.title) {
    update.title = String(body.title);
    update.slug = String(body.slug || slugify(String(body.title)));
  }
  if (body.author) {
    const authorName = String(body.author);
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
    update.author = author._id;
  }
  if (body.description) update.excerpt = String(body.description);
  if (body.content) update.content = String(body.content);
  if (body.category) {
    update.category = String(body.category);
    update.tags = [String(body.category)];
  }
  if (body.thumbnail) update.featuredImage = String(body.thumbnail);
  if (body.status) update.status = String(body.status);
  if (body.readTime) update.readTime = parseInt(String(body.readTime), 10) || 5;

  const item = await BlogModel.findByIdAndUpdate(id, update, { new: true }).populate('author', 'name').lean();
  if (!item) return toResponse(fail('Blog not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok({ ...mapBlogDocumentToPublicBlog(item), status: item.status || 'draft' }));
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminOrDemo(request);
  if (denied) return denied;

  await connectToDatabase();
  await ensureSeededContent();

  const { id } = await params;
  const item = await BlogModel.findByIdAndDelete(id).lean();
  if (!item) return toResponse(fail('Blog not found', 'NOT_FOUND', undefined, 404));
  return toResponse(ok({ deleted: true, id }));
}
