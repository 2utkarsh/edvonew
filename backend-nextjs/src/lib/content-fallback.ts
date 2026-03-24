import { getMockBlogBySlugOrId, MOCK_BLOGS } from '@/lib/blog-data';
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
