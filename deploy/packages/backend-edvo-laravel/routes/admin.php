<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InstructorController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\Course\CategoryChildController;
use App\Http\Controllers\Course\CourseCategoryController;
use App\Http\Controllers\Course\CourseController;
use App\Http\Controllers\Course\CourseCouponController;
use App\Http\Controllers\Course\CourseEnrollmentController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\JobCircularController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\BackupController;
use App\Http\Controllers\Admin\SystemController;
use App\Http\Controllers\BootcampController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\AlumniController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
 */

Route::prefix('dashboard')->group(function () {
    // users
    Route::resource('users', UsersController::class)->only(['index', 'update']);

    // Category
    Route::resource('courses/categories', CourseCategoryController::class)->only(['index', 'store', 'destroy'])->names('categories');
    Route::post('courses/categories/update/{category}', [CourseCategoryController::class, 'update'])->name('categories.update');
    Route::post('courses/categories/sort', [CourseCategoryController::class, 'sort'])->name('categories.sort');
    Route::resource('courses/category-child', CategoryChildController::class)->only(['store', 'update', 'destroy'])->names('category-child');
    Route::post('courses/category-child/sort', [CategoryChildController::class, 'sort'])->name('category-child.sort');

    // course
    Route::delete('courses/{id}', [CourseController::class, 'destroy'])->name('courses.destroy');

    // exam coupon
    Route::resource('courses/course/coupons', CourseCouponController::class)->only(['index', 'store', 'update', 'destroy'])->names('course-coupons');

    // instructor
    Route::middleware('checkCourseCreation')->group(function () {
        Route::get('instructors/applications', [InstructorController::class, 'applications'])->name('instructors.applications');
        Route::put('instructors/status/{id}', [InstructorController::class, 'status'])->name('instructors.status')->middleware('smtpConfig', 'checkSmtp');
        Route::resource('instructors', InstructorController::class)->except(['show', 'update']);
    });

    // course enrolment
    Route::resource('enrollments', CourseEnrollmentController::class)->only(['create', 'destroy']);

    // notification
    Route::resource('newsletters', NewsletterController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::post('newsletters/send', [NewsletterController::class, 'newsletter_send'])->name('newsletters.send')->middleware('smtpConfig', 'checkSmtp');

    // job circulars
    Route::resource('job-circulars', JobCircularController::class)->except(['show']);
    Route::put('job-circulars/{job_circular}/toggle-status', [JobCircularController::class, 'toggleStatus'])->name('job-circulars.toggle-status');

    // settings
    Route::controller(SettingController::class)->prefix('settings')->group(function () {
        Route::get('auth0', 'auth0')->name('settings.auth0');
        Route::post('auth0/{id}', 'auth0_update')->name('settings.auth0.update');

        Route::get('system', 'system')->name('settings.system');
        Route::post('system/{id}', 'system_update')->name('settings.system.update');

        Route::get('pages', 'pages')->name('settings.pages');
        Route::post('home-page/{id}', 'home_pages_update')->name('settings.home-page.update');
        Route::post('system-type', 'system_type_update')->name('settings.system-type.update');

        Route::get('custom-page/{id}', 'custom_pages_edit')->name('settings.custom-page.edit');
        Route::post('custom-page', 'custom_pages_store')->name('settings.custom-page.store');
        Route::put('custom-page/{id}', 'custom_pages_update')->name('settings.custom-page.update');
        Route::delete('custom-page/{id}', 'custom_pages_destroy')->name('settings.custom-page.destroy');

        Route::get('storage', 'storage')->name('settings.storage');
        Route::post('storage/{id}', 'storage_update')->name('settings.storage.update');

        Route::get('smtp', 'smtp')->name('settings.smtp');
        Route::post('smtp/{id}', 'smtp_update')->name('settings.smtp.update');

        Route::get('maintenance', 'maintenance')->name('settings.maintenance');

        Route::get('live-class', 'live_class')->name('settings.live-class');
        Route::post('live-class/{id}', 'live_class_update')->name('settings.live-class.update');

        // Navbar management routes
        Route::post('navbar/{navbar}/items', 'navbar_items_store')->name('settings.navbar.items.store');
        Route::put('navbar-items/{item}', 'navbar_items_update')->name('settings.navbar.items.update');
        Route::delete('navbar-items/{item}', 'navbar_items_destroy')->name('settings.navbar.items.destroy');
        Route::post('navbar-items/reorder', 'navbar_items_reorder')->name('settings.navbar.items.reorder');

        // Footer management routes
        Route::post('footer/{footer}/items', 'footer_items_store')->name('settings.footer.items.store');
        Route::put('footer-items/{item}', 'footer_items_update')->name('settings.footer.items.update');
        Route::delete('footer-items/{item}', 'footer_items_destroy')->name('settings.footer.items.destroy');
        Route::post('footer-items/reorder', 'footer_items_reorder')->name('settings.footer.items.reorder');
    });

    // customize home page sections
    Route::controller(HomeController::class)->prefix('page/section')->group(function () {
        Route::post('sort', 'sort_section')->name('page.section.sort');
        Route::post('update/{id}', 'update_section')->name('page.section.update');
    });
});

Route::get('/demo/{slug}', [HomeController::class, 'demo'])->name('home.demo');

// Analytics Routes
Route::controller(AnalyticsController::class)->prefix('analytics')->group(function () {
    Route::get('dashboard', 'dashboard')->name('analytics.dashboard');
    Route::get('reports', 'reports')->name('analytics.reports');
});

// Report Routes
Route::controller(ReportController::class)->prefix('reports')->group(function () {
    Route::get('/', 'index')->name('reports.index');
    Route::post('generate', 'generateReport')->name('reports.generate');
    Route::get('dashboard', 'dashboard')->name('reports.dashboard');
});

// Backup Routes
Route::controller(BackupController::class)->prefix('backup')->group(function () {
    Route::get('/', 'index')->name('backup.index');
    Route::post('create', 'create')->name('backup.create');
    Route::get('download/{filename}', 'download')->name('backup.download');
    Route::delete('delete/{filename}', 'delete')->name('backup.delete');
    Route::post('restore', 'restore')->name('backup.restore');
});

// System Management Routes
Route::controller(SystemController::class)->prefix('system')->group(function () {
    Route::get('dashboard', 'dashboard')->name('system.dashboard');
    Route::post('maintenance', 'maintenance')->name('system.maintenance');
    Route::post('cache', 'cache')->name('system.cache');
    Route::post('storage', 'storage')->name('system.storage');
    Route::get('logs', 'logs')->name('system.logs');
    Route::post('queue', 'queue')->name('system.queue');
});

// Bootcamp Management Routes
Route::controller(BootcampController::class)->prefix('bootcamps')->group(function () {
    Route::get('/', 'adminIndex')->name('admin.bootcamps.index');
    Route::get('/create', 'adminCreate')->name('admin.bootcamps.create');
    Route::post('/', 'adminStore')->name('admin.bootcamps.store');
    Route::get('/{bootcamp}/edit', 'adminEdit')->name('admin.bootcamps.edit');
    Route::put('/{bootcamp}', 'adminUpdate')->name('admin.bootcamps.update');
    Route::delete('/{bootcamp}', 'adminDestroy')->name('admin.bootcamps.destroy');
});

// Portfolio Management Routes
Route::controller(PortfolioController::class)->prefix('portfolios')->group(function () {
    Route::get('/', 'adminIndex')->name('admin.portfolios.index');
    Route::get('/{portfolio}', 'adminShow')->name('admin.portfolios.show');
    Route::post('/{portfolio}/toggle-visibility', 'adminToggleVisibility')->name('admin.portfolios.toggle-visibility');
});

// Alumni Management Routes
Route::controller(AlumniController::class)->prefix('alumni')->group(function () {
    Route::get('/', 'adminIndex')->name('admin.alumni.index');
    Route::get('/{achievement}', 'adminShow')->name('admin.alumni.show');
    Route::post('/{achievement}/toggle-featured', 'adminToggleFeatured')->name('admin.alumni.toggle-featured');
    Route::post('/{achievement}/approve', 'adminApprove')->name('admin.alumni.approve');
    Route::post('/{achievement}/reject', 'adminReject')->name('admin.alumni.reject');
    Route::delete('/{achievement}', 'adminDelete')->name('admin.alumni.delete');
});
