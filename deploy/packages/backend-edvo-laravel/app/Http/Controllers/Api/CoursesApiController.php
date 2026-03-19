<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course\Course;
use Illuminate\Http\Request;

class CoursesApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::where('status', 'published')
            ->with([
                'instructor.user',
                'course_category',
                'reviews',
                'enrollments',
                'requirements',
                'outcomes',
            ]);

        if ($request->filled('category')) {
            $query->whereHas('course_category', function ($q) use ($request) {
                $q->where('title', $request->category);
            });
        }

        if ($request->filled('level')) {
            $query->where('level', $request->level);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('sort')) {
            switch ($request->sort) {
                case 'popular':
                    $query->withCount('enrollments')->orderBy('enrollments_count', 'desc');
                    break;
                case 'rating':
                    $query->withCount('reviews')->orderBy('reviews_count', 'desc');
                    break;
                case 'price-low':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price-high':
                    $query->orderBy('price', 'desc');
                    break;
            }
        }

        $courses = $query->get();
        $data = $courses->map(fn($course) => $this->mapCourse($course));

        return response()->json([
            'success' => true,
            'data'    => $data,
            'count'   => $data->count(),
        ]);
    }

    public function show($id)
    {
        $course = Course::with([
            'sections.section_lessons',
            'requirements',
            'outcomes',
            'faqs',
            'reviews.user',
            'enrollments',
            'instructor.user',
            'course_category',
        ])->find($id);

        if (!$course) {
            return response()->json([
                'success' => false,
                'error'   => 'Course not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->mapCourse($course, true),
        ]);
    }

    private function mapCourse(Course $course, bool $withDetail = false): array
    {
        $reviews   = $course->reviews ?? collect();
        $avgRating = $reviews->count() > 0
            ? round($reviews->avg('rating'), 1)
            : 0;

        $instructorUser = $course->instructor?->user;

        $discount      = (int) ($course->discount ?? 0);
        $price         = (float) ($course->price ?? 0);
        $discountPrice = (float) ($course->discount_price ?? 0);
        $originalPrice = ($discount > 0 && $discountPrice > 0) ? $price : $price;
        $finalPrice    = ($discount > 0 && $discountPrice > 0) ? $discountPrice : $price;

        $category = $course->course_category?->title ?? '';
        $level    = $course->level ?? '';

        $curriculum = collect();
        if ($withDetail && $course->relationLoaded('sections')) {
            $curriculum = $course->sections->map(function ($section) {
                $lectures = $section->section_lessons->map(function ($lesson) {
                    return [
                        'id'        => (string) $lesson->id,
                        'title'     => $lesson->title ?? '',
                        'duration'  => $lesson->duration ?? '0m',
                        'videoUrl'  => $lesson->lesson_src ?? '',
                        'isFree'    => (bool) ($lesson->is_free ?? false),
                        'completed' => false,
                    ];
                });

                return [
                    'id'       => (string) $section->id,
                    'title'    => $section->title ?? '',
                    'duration' => '0m',
                    'lectures' => $lectures,
                ];
            });
        }

        return [
            'id'               => (string) $course->id,
            'title'            => $course->title ?? '',
            'description'      => $course->short_description ?? '',
            'thumbnail'        => $course->thumbnail ?? '',
            'instructorId'     => (string) ($course->instructor_id ?? ''),
            'instructorName'   => $instructorUser?->name ?? 'Unknown',
            'price'            => $finalPrice,
            'originalPrice'    => $originalPrice,
            'discount'         => $discount,
            'rating'           => $avgRating,
            'reviewCount'      => $reviews->count(),
            'studentsEnrolled' => $course->enrollments?->count() ?? 0,
            'duration'         => '0 hours',
            'lectures'         => 0,
            'level'            => $level,
            'category'         => $category,
            'tags'             => array_values(array_filter([$category, $level])),
            'whatYouWillLearn' => $course->outcomes?->pluck('outcome')->filter()->values() ?? [],
            'requirements'     => $course->requirements?->pluck('requirement')->filter()->values() ?? [],
            'curriculum'       => $curriculum->values(),
            'published'        => $course->status === 'published',
        ];
    }
}