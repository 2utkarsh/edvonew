import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { success, fail, toResponse } from '@/lib/http';
import { CourseModel } from '@/models/Course';
import { UserModel } from '@/models/User';
import { createCourseSchema, courseQuerySchema } from '@/lib/validators';
import { validateRequest } from '@/middleware/auth';
import { buildPagination, buildQueryOptions } from '@/lib/pagination';

// GET all courses with pagination and filters
export async function GET(request: NextRequest): Promise<Response> {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validation = courseQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return toResponse(fail('Invalid query parameters', 'INVALID_QUERY', 
        validation.error.errors.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message,
        })), 400));
    }

    const { page, limit, category, level, minPrice, maxPrice, minRating, search, sort, order } = validation.data;

    // Build filter query - handle undefined values properly
    const filterQuery: any = { status: 'published' };

    if (category) filterQuery.category = category;
    if (level) filterQuery.level = level;
    if (minPrice !== undefined && minPrice !== null) {
      filterQuery.price = { ...filterQuery.price, $gte: minPrice };
    }
    if (maxPrice !== undefined && maxPrice !== null) {
      filterQuery.price = { ...filterQuery.price, $lte: maxPrice };
    }
    if (minRating !== undefined && minRating !== null) {
      filterQuery.rating = { $gte: minRating };
    }
    if (search) {
      filterQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await CourseModel.countDocuments(filterQuery);

    // Build sort options
    const sortOptions: any = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // Get paginated courses
    const courses = await CourseModel.find(filterQuery)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('instructorId', 'name email avatar')
      .lean();

    const meta = buildPagination({ page, limit }, total);

    return toResponse(success(
      {
        courses,
        filters: {
          category,
          level,
          priceRange: { min: minPrice, max: maxPrice },
          minRating,
        },
      },
      'Courses retrieved successfully',
      meta
    ));
  } catch (error: any) {
    console.error('Get courses error:', error);
    return toResponse(fail(
      error.message || 'Failed to fetch courses',
      'FETCH_COURSES_FAILED',
      undefined,
      500
    ));
  }
}

// POST create new course (instructor/admin only)
export async function POST(request: NextRequest): Promise<Response> {
  try {
    await connectToDatabase();

    // Authenticate user
    const authResult = await requireAuth(['instructor', 'admin']);
    if (authResult.error) return toResponse(authResult.error);

    const userId = authResult.payload.sub;

    // Validate request body
    const validation = await validateRequest(request, createCourseSchema);
    if (validation.error) return toResponse(validation.error);
    if (!validation.data) return toResponse(fail('Request body is required', 'INVALID_REQUEST', undefined, 400));

    const courseData = validation.data;

    // Generate slug from title if not provided
    const slug = courseData.slug || courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingCourse = await CourseModel.findOne({ slug });
    if (existingCourse) {
      return toResponse(fail('A course with this slug already exists', 'SLUG_EXISTS', undefined, 409));
    }

    // Get instructor name
    const user = await UserModel.findById(userId);
    if (!user) {
      return toResponse(fail('User not found', 'USER_NOT_FOUND', undefined, 404));
    }

    // Create course
    const course = await CourseModel.create({
      ...courseData,
      slug,
      instructorId: userId,
      instructorName: user.name,
      status: 'draft',
      rating: 0,
      reviewCount: 0,
      studentsEnrolled: 0,
      tags: courseData.tags || [],
      requirements: courseData.requirements || [],
      whatYouWillLearn: courseData.whatYouWillLearn || [],
      curriculum: courseData.curriculum || [],
    });

    // Add course to instructor's created courses
    await UserModel.findByIdAndUpdate(userId, {
      $push: { createdCourses: course._id },
    });

    return toResponse(success(
      {
        course: {
          ...course.toObject(),
          id: course._id.toString(),
        },
      },
      'Course created successfully',
      { status: 201 }
    ));
  } catch (error: any) {
    console.error('Create course error:', error);
    return toResponse(fail(
      error.message || 'Failed to create course',
      'CREATE_COURSE_FAILED',
      undefined,
      500
    ));
  }
}
