export function normalizeBlogCategories(input: unknown): string[] {
  const values = Array.isArray(input)
    ? input
    : typeof input === 'string'
      ? input.split(',')
      : [];

  const seen = new Set<string>();
  const categories: string[] = [];

  for (const value of values) {
    const name = String(value || '').trim();
    if (!name) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    categories.push(name);
  }

  return categories;
}

export function getBlogCategories(input: { categories?: unknown; category?: unknown } | null | undefined): string[] {
  const categories = normalizeBlogCategories(input?.categories);
  const primaryCategory = String(input?.category || '').trim();

  if (
    primaryCategory &&
    !categories.some((item) => item.toLowerCase() === primaryCategory.toLowerCase())
  ) {
    categories.unshift(primaryCategory);
  }

  return categories;
}

export function getPrimaryBlogCategory(
  input: { categories?: unknown; category?: unknown } | null | undefined,
  fallback = 'General'
) {
  const categories = getBlogCategories(input);
  return categories[0] || fallback;
}

export function getBlogCategoryFilterQuery(category: string) {
  const name = String(category || '').trim();
  if (!name) return {};

  return {
    $or: [{ category: name }, { categories: name }],
  };
}
