import { requireAdminOrDemo } from '@/lib/demo-admin';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { created, fail, handleError, ok, toResponse } from '@/lib/http';
import { slugify } from '@/lib/query';
import { CourseCategoryModel } from '@/models/CourseCategory';
import { Types } from 'mongoose';

type CategoryRecord = {
  _id?: unknown;
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  order?: unknown;
  isActive?: unknown;
  parentCategoryId?: unknown;
};

function toId(value: unknown) {
  return value == null ? '' : String(value);
}

function normalizeChildCategory(
  item: CategoryRecord,
  parentNames: Map<string, string>,
) {
  const id = toId(item._id || item.id);
  const parentId = toId(item.parentCategoryId);
  return {
    ...item,
    id,
    _id: id,
    title: String(item.name || ''),
    parent: parentNames.get(parentId) || '',
    sort: Number(item.order || 0),
    isActive: item.isActive === undefined ? true : Boolean(item.isActive),
  };
}

async function resolveParentCategoryId(parentValue: unknown) {
  const raw = String(parentValue || '').trim();
  if (!raw) {
    return undefined;
  }

  const matchers: Array<Record<string, unknown>> = [{ name: raw }, { slug: raw }];
  if (Types.ObjectId.isValid(raw)) {
    matchers.unshift({ _id: raw });
  }

  const parent = await CourseCategoryModel.findOne({
    parentCategoryId: { $exists: false },
    $or: matchers,
  })
    .select('_id')
    .lean();

  if (!parent?._id) {
    throw new Error('Parent category not found');
  }

  return parent._id;
}

export async function GET(request: Request) {
  try {
    const denied = await requireAdminOrDemo(request);
    if (denied) return denied;

    if (!hasConfiguredMongoUri()) {
      return toResponse(ok([]));
    }

    await connectToDatabase();

    const [items, parents] = await Promise.all([
      CourseCategoryModel.find({ parentCategoryId: { $exists: true, $ne: null } })
        .sort({ order: 1, updatedAt: -1 })
        .lean(),
      CourseCategoryModel.find({ parentCategoryId: { $exists: false } })
        .select('name')
        .lean(),
    ]);

    const parentNames = new Map(parents.map((parent) => [toId(parent._id), String(parent.name || '')]));
    return toResponse(ok(items.map((item) => normalizeChildCategory(item, parentNames))));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const denied = await requireAdminOrDemo(request);
    if (denied) return denied;

    if (!hasConfiguredMongoUri()) {
      return toResponse(fail('Sub categories require a configured database', 'NOT_IMPLEMENTED', undefined, 501));
    }

    await connectToDatabase();
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.title || body.name || 'Untitled Child Category').trim();
    const slug = String(body.slug || slugify(name)).trim() || slugify(name);
    const parentCategoryId = await resolveParentCategoryId(body.parent);

    const duplicate = await CourseCategoryModel.findOne({
      $or: [{ name }, { slug }],
    }).lean();
    if (duplicate) {
      return toResponse(fail('A sub category with this name or slug already exists', 'CONFLICT', undefined, 409));
    }

    const item = await CourseCategoryModel.create({
      name,
      slug,
      description: '',
      icon: '',
      color: '#c17017',
      order: Number(body.sort || body.order || 0),
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
      courseCount: 0,
      ...(parentCategoryId ? { parentCategoryId } : {}),
    });

    const parentNames = new Map<string, string>();
    if (parentCategoryId) {
      const parent = await CourseCategoryModel.findById(parentCategoryId).select('name').lean();
      parentNames.set(toId(parentCategoryId), String(parent?.name || ''));
    }

    return toResponse(created(normalizeChildCategory(item.toObject(), parentNames)));
  } catch (error) {
    return handleError(error);
  }
}
