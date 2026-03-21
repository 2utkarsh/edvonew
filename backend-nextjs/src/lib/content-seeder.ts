import { hashPassword } from '@/lib/auth';
import { BlogModel } from '@/models/Blog';
import { TeamMemberModel } from '@/models/TeamMember';
import { UserModel } from '@/models/User';
import { MOCK_BLOGS } from '@/lib/blog-data';
import { MOCK_TEAM_MEMBERS } from '@/lib/team-data';

declare global {
  var __edvoContentSeeded: boolean | undefined;
}

function authorEmail(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '')}@edvo.local`;
}

export async function ensureSeededContent() {
  if (global.__edvoContentSeeded) {
    return;
  }

  const passwordHash = await hashPassword('admin123');
  const authorIds = new Map<string, string>();

  for (const blog of MOCK_BLOGS) {
    const email = authorEmail(blog.author);
    const user = await UserModel.findOneAndUpdate(
      { email },
      {
        $set: {
          name: blog.author,
          email,
          role: 'instructor',
          passwordHash,
          isActive: true,
          photo: '/images/edvo-official-logo-v10.png',
          bio: blog.description,
          headline: blog.category,
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

    authorIds.set(blog.author, String(user._id));
  }

  for (const blog of MOCK_BLOGS) {
    await BlogModel.findOneAndUpdate(
      { slug: blog.slug },
      {
        $set: {
          title: blog.title,
          slug: blog.slug,
          content: blog.content.join('\n\n'),
          excerpt: blog.description,
          featuredImage: blog.thumbnail,
          category: blog.category,
          tags: [blog.category],
          author: authorIds.get(blog.author),
          status: 'published',
          readTime: parseInt(blog.readTime, 10) || 5,
          publishedAt: new Date(blog.date),
          metaTitle: blog.title,
          metaDescription: blog.description,
        },
      },
      { upsert: true, new: true }
    );
  }

  for (const member of MOCK_TEAM_MEMBERS) {
    await TeamMemberModel.findOneAndUpdate(
      { slug: member.id },
      {
        $set: {
          name: member.name,
          slug: member.id,
          title: member.title,
          bio: member.bio,
          image: member.image,
          status: 'active',
        },
      },
      { upsert: true, new: true }
    );
  }

  global.__edvoContentSeeded = true;
}
