import { getMockBlogBySlugOrId, MOCK_BLOGS } from '@/lib/blog-data';
import { MOCK_CHALLENGES } from '@/lib/challenge-data';
import { MOCK_COURSE_REVIEWS } from '@/lib/course-review-data';
import { MOCK_EVENTS } from '@/lib/event-data';
import { slugify } from '@/lib/query';
import { MOCK_GUIDES, MOCK_TUTORIALS } from '@/lib/resource-data';
import { MOCK_SUCCESS_STORIES } from '@/lib/success-story-data';
import { MOCK_TEAM_MEMBERS } from '@/lib/team-data';

function sortByOrder<T extends { order?: number }>(items: T[]) {
  return items.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getFallbackPublicBlogs(category?: string) {
  const items = category ? MOCK_BLOGS.filter((blog) => blog.category === category) : MOCK_BLOGS;
  return items.slice();
}

export function getFallbackAdminBlogs() {
  return MOCK_BLOGS.map((blog, index) => ({
    ...blog,
    order: index + 1,
  }));
}

export function getFallbackBlogBySlugOrId(value: string) {
  return getMockBlogBySlugOrId(value);
}

export function getFallbackBlogCategories() {
  return Array.from(new Set(MOCK_BLOGS.map((blog) => blog.category))).map((name, index) => ({
    id: `blog-category-${slugify(name)}`,
    name,
    slug: slugify(name),
    description: `${name} blog posts`,
    isActive: true,
    order: index + 1,
  }));
}

export function getFallbackTutorials() {
  return sortByOrder(MOCK_TUTORIALS);
}

export function getFallbackGuides() {
  return sortByOrder(MOCK_GUIDES);
}

export function getFallbackTeamMembers() {
  return MOCK_TEAM_MEMBERS.map((member, index) => ({
    ...member,
    order: member.order || index + 1,
  })).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getFallbackSuccessStories(category?: string) {
  const items = MOCK_SUCCESS_STORIES.filter((story) => story.status === 'active');
  if (!category || category === 'All') {
    return sortByOrder(items);
  }
  return sortByOrder(items.filter((story) => story.category === category));
}

export function getFallbackAdminSuccessStories() {
  return sortByOrder(
    MOCK_SUCCESS_STORIES.map((story, index) => ({
      ...story,
      order: story.order || index + 1,
    }))
  );
}

export function getFallbackSuccessStoryCategories() {
  return Array.from(new Set(MOCK_SUCCESS_STORIES.map((story) => story.category))).map((name, index) => ({
    id: `success-story-category-${slugify(name)}`,
    name,
    slug: slugify(name),
    description: `${name} success stories`,
    isActive: true,
    order: index + 1,
  }));
}

export function getFallbackCourseReviews(category?: string) {
  const items = MOCK_COURSE_REVIEWS.filter((item) => item.status === 'active');
  if (!category || category === 'all') {
    return sortByOrder(items);
  }
  return sortByOrder(items.filter((item) => item.category === category));
}

export function getFallbackCourseReviewCategories() {
  const counts = new Map<string, number>();
  getFallbackCourseReviews().forEach((item) => {
    counts.set(item.category, Number(counts.get(item.category) || 0) + 1);
  });

  return Array.from(counts.keys()).map((name, index) => ({
    id: `course-review-category-${slugify(name)}`,
    label: name,
    slug: slugify(name),
    description: `${name} course reviews`,
    isActive: true,
    order: index + 1,
    total: Number(counts.get(name) || 0),
  }));
}

export function getFallbackChallenges(phase?: string, category?: string) {
  let items = MOCK_CHALLENGES.filter((item) => item.visibility === 'active');
  if (phase && ['ongoing', 'completed'].includes(phase)) {
    items = items.filter((item) => item.phase === phase);
  }
  if (category) {
    items = items.filter((item) => item.category === category);
  }
  return sortByOrder(items);
}

export function getFallbackChallengeBySlug(slug: string) {
  return getFallbackChallenges().find((item) => item.slug === slug) || null;
}

export function getFallbackChallengeCategories() {
  return Array.from(new Set(MOCK_CHALLENGES.map((item) => item.category))).map((name, index) => ({
    id: `challenge-category-${slugify(name)}`,
    name,
    slug: slugify(name),
    description: `${name} challenges`,
    isActive: true,
    order: index + 1,
  }));
}

export function getFallbackEvents(type?: string, category?: string) {
  let items = MOCK_EVENTS.filter((item) => item.visibility === 'active');
  if (type && ['webinar', 'workshop', 'hackathon'].includes(type)) {
    items = items.filter((item) => item.type === type);
  }
  if (category) {
    items = items.filter((item) => item.category === category);
  }
  return sortByOrder(items);
}

export function getFallbackEventById(value: string) {
  return getFallbackEvents().find((item) => item.id === value || item.slug === value) || null;
}

export function getFallbackEventCategories(type?: string) {
  return Array.from(new Set(getFallbackEvents(type).map((item) => item.category))).map((name, index) => ({
    id: `event-category-${slugify(`${type || 'all'}-${name}`)}`,
    name,
    slug: slugify(`${type || 'all'}-${name}`),
    description: `${name} ${type || 'event'} listings`,
    isActive: true,
    order: index + 1,
  }));
}
