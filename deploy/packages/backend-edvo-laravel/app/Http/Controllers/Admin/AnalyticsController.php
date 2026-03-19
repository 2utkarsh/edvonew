<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function dashboard()
    {
        $analytics = [
            'users' => $this->getUsersAnalytics(),
            'courses' => $this->getCoursesAnalytics(),
            'revenue' => $this->getRevenueAnalytics(),
            'enrollments' => $this->getEnrollmentAnalytics(),
        ];

        return response()->json($analytics);
    }

    public function getUsersAnalytics()
    {
        $totalUsers = User::count();
        $activeUsers = User::where('last_login_at', '>=', now()->subDays(30))->count();
        $newUsersThisMonth = User::where('created_at', '>=', now()->startOfMonth())->count();
        
        $userGrowth = User::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'total' => $totalUsers,
            'active' => $activeUsers,
            'new_this_month' => $newUsersThisMonth,
            'growth_chart' => $userGrowth,
        ];
    }

    public function getCoursesAnalytics()
    {
        $totalCourses = Course::count();
        $publishedCourses = Course::where('status', 'published')->count();
        $draftCourses = Course::where('status', 'draft')->count();
        
        $coursesByCategory = Course::join('course_categories', 'courses.category_id', '=', 'course_categories.id')
            ->selectRaw('course_categories.name as category, COUNT(*) as count')
            ->groupBy('course_categories.id', 'course_categories.name')
            ->get();

        return [
            'total' => $totalCourses,
            'published' => $publishedCourses,
            'draft' => $draftCourses,
            'by_category' => $coursesByCategory,
        ];
    }

    public function getRevenueAnalytics()
    {
        $totalRevenue = Order::where('status', 'completed')->sum('amount');
        $revenueThisMonth = Order::where('status', 'completed')
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('amount');
        
        $revenueChart = Order::selectRaw('DATE(created_at) as date, SUM(amount) as revenue')
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'total' => $totalRevenue,
            'this_month' => $revenueThisMonth,
            'chart' => $revenueChart,
        ];
    }

    public function getEnrollmentAnalytics()
    {
        $totalEnrollments = Enrollment::count();
        $enrollmentsThisMonth = Enrollment::where('created_at', '>=', now()->startOfMonth())->count();
        
        $enrollmentTrend = Enrollment::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'total' => $totalEnrollments,
            'this_month' => $enrollmentsThisMonth,
            'trend' => $enrollmentTrend,
        ];
    }

    public function reports(Request $request)
    {
        $type = $request->get('type', 'users');
        $startDate = $request->get('start_date', now()->subDays(30));
        $endDate = $request->get('end_date', now());

        switch ($type) {
            case 'users':
                return $this->getUserReports($startDate, $endDate);
            case 'courses':
                return $this->getCourseReports($startDate, $endDate);
            case 'revenue':
                return $this->getRevenueReports($startDate, $endDate);
            default:
                return response()->json(['error' => 'Invalid report type'], 400);
        }
    }

    private function getUserReports($startDate, $endDate)
    {
        $users = User::whereBetween('created_at', [$startDate, $endDate])
            ->select(['id', 'name', 'email', 'role', 'created_at'])
            ->get();

        return response()->json([
            'data' => $users,
            'total' => $users->count(),
        ]);
    }

    private function getCourseReports($startDate, $endDate)
    {
        $courses = Course::whereBetween('created_at', [$startDate, $endDate])
            ->with(['category', 'enrollments'])
            ->get();

        return response()->json([
            'data' => $courses,
            'total' => $courses->count(),
        ]);
    }

    private function getRevenueReports($startDate, $endDate)
    {
        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->with(['user', 'items'])
            ->get();

        return response()->json([
            'data' => $orders,
            'total' => $orders->sum('amount'),
        ]);
    }
}
