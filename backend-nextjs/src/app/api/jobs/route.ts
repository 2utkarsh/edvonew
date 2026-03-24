import { connectToDatabase } from '@/lib/db';
import { handleError, ok, toResponse } from '@/lib/http';
import { buildSearchRegex, getPagination } from '@/lib/query';
import { JobModel } from '@/models/Job';

function formatSalary(salary: any) {
  if (!salary || typeof salary !== 'object') return 'Compensation discussed during hiring';

  const currency = String(salary.currency || 'INR').toUpperCase();
  const period = salary.period ? `/${salary.period}` : '';
  const min = Number(salary.min || 0);
  const max = Number(salary.max || 0);

  if (min && max) return `${currency} ${min.toLocaleString('en-IN')} - ${max.toLocaleString('en-IN')}${period}`;
  if (min) return `${currency} ${min.toLocaleString('en-IN')}${period}`;
  if (max) return `${currency} ${max.toLocaleString('en-IN')}${period}`;
  return 'Compensation discussed during hiring';
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);
    const query: Record<string, any> = {
      status: 'active',
      $and: [
        {
          $or: [
            { applicationDeadline: { $exists: false } },
            { applicationDeadline: { $gte: new Date() } },
          ],
        },
      ],
    };

    const search = buildSearchRegex(searchParams.get('search'));
    if (search) {
      query.$and.push({
        $or: [{ title: search }, { company: search }, { description: search }, { requirements: search }],
      });
    }

    const type = searchParams.get('type');
    if (type) query.type = type;

    const location = searchParams.get('location');
    if (location) query.location = location;

    const [items, total] = await Promise.all([
      JobModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      JobModel.countDocuments(query),
    ]);

    return toResponse(
      ok({
        data: items.map((item: any) => ({
          id: String(item._id),
          title: item.title,
          company: item.company,
          logo: '',
          location: item.location,
          type: item.type,
          mode: item.mode,
          salary: formatSalary(item.salary),
          description: item.description,
          requirements: Array.isArray(item.requirements) ? item.requirements : [],
          skills: Array.isArray(item.requirements) ? item.requirements : [],
          experience: Array.isArray(item.responsibilities) && item.responsibilities.length ? item.responsibilities[0] : '',
          postedDate: item.createdAt,
          applicationDeadline: item.applicationDeadline,
          applicants: Number(item.applicationCount || 0),
          applyUrl: item.applicationUrl,
        })),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    return handleError(error);
  }
}
