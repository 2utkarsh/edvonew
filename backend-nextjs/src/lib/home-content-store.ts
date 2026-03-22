import { DEFAULT_HOME_CONTENT } from '@/lib/home-content-data';
import { HomeContentModel } from '@/models/HomeContent';

export async function ensureHomeContent() {
  const existing = await HomeContentModel.findOne({ key: 'home' }).lean();
  if (existing) return existing;
  const created = await HomeContentModel.create(DEFAULT_HOME_CONTENT);
  return created.toObject();
}
