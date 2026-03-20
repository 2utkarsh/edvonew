import { connectToDatabase } from '@/lib/db';
import { handleError, ok } from '@/lib/http';
import { buildSearchRegex, getPagination } from '@/lib/query';
import { JobModel } from '@/models/Job';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);
    const query: Record<string, unknown> = { status: 'published' };

    const search = buildSearchRegex(searchParams.get('search'));
    if (search) query.$or = [{ title: search }, { company: search }, { skills: search }];

    const type = searchParams.get('type');
    if (type) query.type = type;

    const location = searchParams.get('location');
    if (location) query.location = location;

    const [items, total] = await Promise.all([
      JobModel.find(query).sort({ postedDate: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      JobModel.countDocuments(query),
    ]);

    return ok({
      data: items.map((item) => ({
        id: String(item._id),
        title: item.title,
        company: item.company,
        logo: item.logo,
        location: item.location,
        type: item.type,
        salary: item.salary,
        description: item.description,
        requirements: item.requirements,
        skills: item.skills,
        experience: item.experience,
        postedDate: item.postedDate,
        applicationDeadline: item.applicationDeadline,
        applicants: item.applicants,
        applyUrl: item.applyUrl,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleError(error);
  }
}

