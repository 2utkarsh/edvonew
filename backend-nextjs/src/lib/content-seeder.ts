import { hashPassword } from '@/lib/auth';
import { MOCK_BLOGS } from '@/lib/blog-data';
import { MOCK_CHALLENGES } from '@/lib/challenge-data';
import { MOCK_COURSE_REVIEWS } from '@/lib/course-review-data';
import { MOCK_EVENTS } from '@/lib/event-data';
import { MOCK_GUIDES, MOCK_TUTORIALS } from '@/lib/resource-data';
import { MOCK_SUCCESS_STORIES } from '@/lib/success-story-data';
import { MOCK_TEAM_MEMBERS } from '@/lib/team-data';
import { slugify } from '@/lib/query';
import { BlogCategoryModel, BlogModel } from '@/models/Blog';
import { ChallengeCategoryModel, ChallengeItemModel } from '@/models/ChallengeItem';
import { CourseReviewCategoryModel, CourseReviewItemModel } from '@/models/CourseReviewItem';
import { EventCategoryModel, EventItemModel } from '@/models/EventItem';
import { ResourceItemModel } from '@/models/ResourceItem';
import { SuccessStoryCategoryModel, SuccessStoryModel } from '@/models/SuccessStory';
import { TeamMemberModel } from '@/models/TeamMember';
import { UserModel } from '@/models/User';

declare global {
  var __edvoContentSeeded: boolean | undefined;
}

function authorEmail(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '')}@edvo.local`;
}

export async function ensureSeededContent() {
  if (global.__edvoContentSeeded) return;

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
        $setOnInsert: { socialLinks: [], skills: [], enrolledCourses: [], enrolledExams: [], createdCourses: [], createdExams: [] },
      },
      { upsert: true, new: true }
    );
    authorIds.set(blog.author, String(user._id));
  }

  const orderedBlogCategories = Array.from(new Set(MOCK_BLOGS.map((blog) => blog.category)));
  for (const [index, category] of orderedBlogCategories.entries()) {
    await BlogCategoryModel.findOneAndUpdate({ slug: slugify(category) }, { $set: { name: category, slug: slugify(category), description: `${category} blog posts`, isActive: true, order: index + 1 } }, { upsert: true, new: true });
  }

  for (const [index, blog] of MOCK_BLOGS.entries()) {
    await BlogModel.findOneAndUpdate(
      { slug: blog.slug },
      { $set: { title: blog.title, slug: blog.slug, content: blog.content.join('\n\n'), excerpt: blog.description, featuredImage: blog.thumbnail, category: blog.category, tags: [blog.category], author: authorIds.get(blog.author), status: 'published', order: index + 1, readTime: parseInt(blog.readTime, 10) || 5, publishedAt: new Date(blog.date), metaTitle: blog.title, metaDescription: blog.description } },
      { upsert: true, new: true }
    );
  }

  for (const [index, member] of MOCK_TEAM_MEMBERS.entries()) {
    await TeamMemberModel.findOneAndUpdate({ slug: member.id }, { $set: { name: member.name, slug: member.id, title: member.title, bio: member.bio, image: member.image, status: 'active', order: index + 1 } }, { upsert: true, new: true });
  }

  for (const tutorial of MOCK_TUTORIALS) {
    await ResourceItemModel.findOneAndUpdate({ slug: tutorial.slug }, { $set: { type: 'tutorial', title: tutorial.title, slug: tutorial.slug, description: tutorial.description, thumbnail: tutorial.thumbnail, category: tutorial.category, tool: tutorial.tool, duration: tutorial.duration, level: tutorial.level, status: tutorial.status, order: tutorial.order } }, { upsert: true, new: true });
  }

  for (const guide of MOCK_GUIDES) {
    await ResourceItemModel.findOneAndUpdate({ slug: guide.slug }, { $set: { type: 'guide', title: guide.title, slug: guide.slug, description: guide.description, thumbnail: guide.thumbnail, category: guide.track, track: guide.track, steps: guide.steps, highlight: guide.highlight, icon: guide.icon, status: guide.status, order: guide.order } }, { upsert: true, new: true });
  }

  const courseReviewCategories = Array.from(new Set(MOCK_COURSE_REVIEWS.map((review) => review.category)));
  for (const [index, category] of courseReviewCategories.entries()) {
    await CourseReviewCategoryModel.findOneAndUpdate(
      { slug: slugify(category) },
      { $set: { name: category, slug: slugify(category), description: `${category} course reviews`, isActive: true, order: index + 1 } },
      { upsert: true, new: true }
    );
  }

  for (const [index, review] of MOCK_COURSE_REVIEWS.entries()) {
    await CourseReviewItemModel.findOneAndUpdate(
      { reviewerName: review.reviewerName, courseName: review.courseName, sourceLabel: review.sourceLabel },
      { $set: { ...review, sourceType: 'manual', order: review.order || index + 1 } },
      { upsert: true, new: true }
    );
  }

  const storyCategories = Array.from(new Set(MOCK_SUCCESS_STORIES.map((story) => story.category)));
  for (const [index, category] of storyCategories.entries()) {
    await SuccessStoryCategoryModel.findOneAndUpdate({ slug: slugify(category) }, { $set: { name: category, slug: slugify(category), description: `${category} career transitions`, isActive: true, order: index + 1 } }, { upsert: true, new: true });
  }

  for (const [index, story] of MOCK_SUCCESS_STORIES.entries()) {
    await SuccessStoryModel.findOneAndUpdate({ slug: story.id }, { $set: { name: story.name, slug: story.id, location: story.location, beforeRole: story.beforeRole, afterRole: story.afterRole, companyLogo: story.companyLogo, avatar: story.avatar, linkedinUrl: story.linkedinUrl, category: story.category, tags: story.tags, status: story.status, order: story.order || index + 1 } }, { upsert: true, new: true });
  }

  const eventCategories = new Map<string, string[]>();
  for (const event of MOCK_EVENTS) eventCategories.set(event.type, [...(eventCategories.get(event.type) || []), event.category]);
  for (const [type, values] of eventCategories.entries()) {
    for (const [index, category] of Array.from(new Set(values)).entries()) {
      await EventCategoryModel.findOneAndUpdate({ slug: slugify(`${type}-${category}`) }, { $set: { type, name: category, slug: slugify(`${type}-${category}`), description: `${category} ${type} events`, isActive: true, order: index + 1 } }, { upsert: true, new: true });
    }
  }
  for (const event of MOCK_EVENTS) {
    await EventItemModel.findOneAndUpdate({ slug: event.slug }, { $set: { type: event.type, title: event.title, slug: event.slug, description: event.description, category: event.category, image: event.image, date: event.date, time: event.time, location: event.location, status: event.status, visibility: event.visibility, order: event.order, speakers: event.speakers || [], prizes: event.prizes, duration: event.duration } }, { upsert: true, new: true });
  }

  const challengeCategories = Array.from(new Set(MOCK_CHALLENGES.map((challenge) => challenge.category)));
  for (const [index, category] of challengeCategories.entries()) {
    await ChallengeCategoryModel.findOneAndUpdate({ slug: slugify(category) }, { $set: { name: category, slug: slugify(category), description: `${category} challenges`, isActive: true, order: index + 1 } }, { upsert: true, new: true });
  }

  for (const [index, challenge] of MOCK_CHALLENGES.entries()) {
    await ChallengeItemModel.findOneAndUpdate(
      { slug: challenge.slug },
      {
        $set: {
          title: challenge.title,
          slug: challenge.slug,
          description: challenge.description,
          image: challenge.image,
          category: challenge.category,
          phase: challenge.phase,
          visibility: challenge.visibility,
          order: challenge.order || index + 1,
          prize: challenge.prize,
          participants: challenge.participants,
          href: challenge.href,
          badge: challenge.badge,
          objective: challenge.objective,
          duration: challenge.duration,
          difficulty: challenge.difficulty,
          tools: challenge.tools,
          deliverables: challenge.deliverables,
          steps: challenge.steps,
          actionUrl: challenge.actionUrl,
        },
      },
      { upsert: true, new: true }
    );
  }

  global.__edvoContentSeeded = true;
}
