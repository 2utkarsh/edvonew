import { requireAdminOrDemo } from '@/lib/demo-admin';
import { connectToDatabase, hasConfiguredMongoUri } from '@/lib/db';
import { fail, handleError, ok, toResponse } from '@/lib/http';
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

async function getParentNames() {
  const parents = await CourseCategoryModel.find({ parentCategoryId: { $exists: false } })
    .select('name')
    .lean();
  return new Map(parents.map((parent) => [toId(parent._id), String(parent.name || '')]));
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
    return null;
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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const denied = await requireAdminOrDemo(request);
    if (denied) return denied;

    if (!hasConfiguredMongoUri()) {
      return toResponse(fail('Sub category not found', 'NOT_FOUND', undefined, 404));
    }

    await connectToDatabase();
    const { id } = await params;
    const item = await CourseCategoryModel.findOne({ _id: id, parentCategoryId: { $exists: true, $ne: null } }).lean();
    if (!item) return toResponse(fail('Course child category not found', 'NOT_FOUND', undefined, 404));

    return toResponse(ok(normalizeChildCategory(item, await getParentNames())));
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const denied = await requireAdminOrDemo(request);
    if (denied) return denied;

    if (!hasConfiguredMongoUri()) {
      return toResponse(fail('Sub categories require a configured database', 'NOT_IMPLEMENTED', undefined, 501));
    }

    await connectToDatabase();
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const current = await CourseCategoryModel.findOne({ _id: id, parentCategoryId: { $exists: true, $ne: null } }).lean();
    if (!current) return toResponse(fail('Course child category not found', 'NOT_FOUND', undefined, 404));

    const rawName = body.title || body.name;
    const nextName = rawName ? String(rawName).trim() : String(current.name || '');
    const nextSlug = body.slug ? String(body.slug).trim() : rawName ? slugify(String(rawName)) : String(current.slug || '');
    const duplicate = await CourseCategoryModel.findOne({
      _id: { $ne: id },
      $or: [{ name: nextName }, { slug: nextSlug }],
    }).lean();
    if (duplicate) {
      return toResponse(fail('A sub category with this name or slug already exists', 'CONFLICT', undefined, 409));
    }

    const parentCategoryId = body.parent !== undefined ? await resolveParentCategoryId(body.parent) : current.parentCategoryId || null;
    const update = {
      ...(rawName ? { name: nextName } : {}),
      ...(nextSlug ? { slug: nextSlug } : {}),
      ...(body.sort !== undefined || body.order !== undefined ? { order: Number(body.sort || body.order || 0) } : {}),
      ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
      parentCategoryId,
    };

    const item = await CourseCategoryModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!item) return toResponse(fail('Course child category not found', 'NOT_FOUND', undefined, 404));

    return toResponse(ok(normalizeChildCategory(item, await getParentNames())));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const denied = await requireAdminOrDemo(request);
    if (denied) return denied;

    if (!hasConfiguredMongoUri()) {
      return toResponse(fail('Sub categories require a configured database', 'NOT_IMPLEMENTED', undefined, 501));
    }

    await connectToDatabase();
    const { id } = await params;
    const item = await CourseCategoryModel.findOneAndDelete({ _id: id, parentCategoryId: { $exists: true, $ne: null } }).lean();
    if (!item) return toResponse(fail('Course child category not found', 'NOT_FOUND', undefined, 404));
    return toResponse(ok({ deleted: true, id }));
  } catch (error) {
    return handleError(error);
  }
}
