<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\Assignment;
use App\Models\Quiz;
use App\Models\QuizSubmission;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\UsersExport;
use App\Exports\CoursesExport;
use App\Exports\EnrollmentsExport;
use App\Exports\RevenueExport;

class ReportController extends Controller
{
    public function index()
    {
        return view('admin.reports.index');
    }

    public function generateReport(Request $request)
    {
        $type = $request->get('type');
        $format = $request->get('format', 'view');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        switch ($type) {
            case 'users':
                return $this->generateUsersReport($format, $startDate, $endDate);
            case 'courses':
                return $this->generateCoursesReport($format, $startDate, $endDate);
            case 'enrollments':
                return $this->generateEnrollmentsReport($format, $startDate, $endDate);
            case 'revenue':
                return $this->generateRevenueReport($format, $startDate, $endDate);
            case 'assignments':
                return $this->generateAssignmentsReport($format, $startDate, $endDate);
            case 'quizzes':
                return $this->generateQuizzesReport($format, $startDate, $endDate);
            default:
                return response()->json(['error' => 'Invalid report type'], 400);
        }
    }

    private function generateUsersReport($format, $startDate, $endDate)
    {
        $query = User::query();

        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $users = $query->with(['enrollments.course'])->get();

        $reportData = [
            'total_users' => $users->count(),
            'active_users' => $users->where('status', 'active')->count(),
            'inactive_users' => $users->where('status', 'inactive')->count(),
            'users_by_role' => $users->groupBy('role')->map->count(),
            'new_users_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
        ];

        if ($format === 'excel') {
            return Excel::download(new UsersExport($users), 'users-report.xlsx');
        }

        return response()->json([
            'data' => $users,
            'statistics' => $reportData,
        ]);
    }

    private function generateCoursesReport($format, $startDate, $endDate)
    {
        $query = Course::query();

        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $courses = $query->with(['category', 'enrollments', 'instructor'])->get();

        $reportData = [
            'total_courses' => $courses->count(),
            'published_courses' => $courses->where('status', 'published')->count(),
            'draft_courses' => $courses->where('status', 'draft')->count(),
            'courses_by_category' => $courses->groupBy('category.name')->map->count(),
            'average_enrollments_per_course' => $courses->avg('enrollments_count'),
        ];

        if ($format === 'excel') {
            return Excel::download(new CoursesExport($courses), 'courses-report.xlsx');
        }

        return response()->json([
            'data' => $courses,
            'statistics' => $reportData,
        ]);
    }

    private function generateEnrollmentsReport($format, $startDate, $endDate)
    {
        $query = Enrollment::query();

        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $enrollments = $query->with(['user', 'course', 'progress'])->get();

        $reportData = [
            'total_enrollments' => $enrollments->count(),
            'completed_enrollments' => $enrollments->where('status', 'completed')->count(),
            'active_enrollments' => $enrollments->where('status', 'active')->count(),
            'enrollments_this_month' => Enrollment::where('created_at', '>=', now()->startOfMonth())->count(),
            'completion_rate' => $enrollments->where('status', 'completed')->count() / max($enrollments->count(), 1) * 100,
        ];

        if ($format === 'excel') {
            return Excel::download(new EnrollmentsExport($enrollments), 'enrollments-report.xlsx');
        }

        return response()->json([
            'data' => $enrollments,
            'statistics' => $reportData,
        ]);
    }

    private function generateRevenueReport($format, $startDate, $endDate)
    {
        $query = Order::query()->where('status', 'completed');

        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $orders = $query->with(['user', 'items.course'])->get();

        $reportData = [
            'total_revenue' => $orders->sum('amount'),
            'total_orders' => $orders->count(),
            'average_order_value' => $orders->avg('amount'),
            'revenue_this_month' => Order::where('status', 'completed')
                ->where('created_at', '>=', now()->startOfMonth())
                ->sum('amount'),
            'orders_by_payment_method' => $orders->groupBy('payment_method')->map->count(),
        ];

        if ($format === 'excel') {
            return Excel::download(new RevenueExport($orders), 'revenue-report.xlsx');
        }

        return response()->json([
            'data' => $orders,
            'statistics' => $reportData,
        ]);
    }

    private function generateAssignmentsReport($format, $startDate, $endDate)
    {
        $query = Assignment::query();

        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $assignments = $query->with(['course', 'submissions.user', 'submissions'])->get();

        $reportData = [
            'total_assignments' => $assignments->count(),
            'total_submissions' => $assignments->sum('submissions_count'),
            'average_submissions_per_assignment' => $assignments->avg('submissions_count'),
            'assignments_by_course' => $assignments->groupBy('course.title')->map->count(),
        ];

        return response()->json([
            'data' => $assignments,
            'statistics' => $reportData,
        ]);
    }

    private function generateQuizzesReport($format, $startDate, $endDate)
    {
        $query = Quiz::query();

        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $quizzes = $query->with(['course', 'submissions.user', 'submissions'])->get();

        $reportData = [
            'total_quizzes' => $quizzes->count(),
            'total_submissions' => $quizzes->sum('submissions_count'),
            'average_score' => $quizzes->flatMap->submissions->avg('score'),
            'quizzes_by_course' => $quizzes->groupBy('course.title')->map->count(),
        ];

        return response()->json([
            'data' => $quizzes,
            'statistics' => $reportData,
        ]);
    }

    public function dashboard()
    {
        $dashboardData = [
            'total_users' => User::count(),
            'total_courses' => Course::count(),
            'total_enrollments' => Enrollment::count(),
            'total_revenue' => Order::where('status', 'completed')->sum('amount'),
            'new_users_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
            'new_enrollments_this_month' => Enrollment::where('created_at', '>=', now()->startOfMonth())->count(),
            'revenue_this_month' => Order::where('status', 'completed')
                ->where('created_at', '>=', now()->startOfMonth())
                ->sum('amount'),
        ];

        return response()->json($dashboardData);
    }
}
