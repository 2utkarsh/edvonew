export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 12)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildSearchRegex(value: string | null) {
  if (!value) return null;
  return new RegExp(value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

