<?php

use App\Http\Controllers\Course\CourseController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InstructorController;
use App\Http\Controllers\JobCircularController;
use App\Http\Controllers\SubscribeController;
use App\Http\Controllers\BootcampController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\AlumniController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home')->middleware('customize');
Route::get('demo/{slug}', [HomeController::class, 'demo'])->name('home.demo')->middleware('customize');
Route::get('job-circulars/{job_circular}', [JobCircularController::class, 'show'])->name('job-circulars.show');

// course page
Route::controller(CourseController::class)->group(function () {
    Route::get('courses/{category}/{category_child?}', 'category_courses')->name('category.courses');
    Route::get('courses/details/{slug}/{id}', 'show')->name('course.details');
});

Route::get('instructors/{instructor}', [InstructorController::class, 'show'])->name('instructors.show');
Route::resource('subscribes', SubscribeController::class)->only(['index', 'store']);

// Bootcamp Routes
Route::controller(BootcampController::class)->group(function () {
    Route::get('bootcamps', 'index')->name('bootcamps.index');
    Route::get('bootcamps/{bootcamp}', 'show')->name('bootcamps.show');
    Route::post('bootcamps/{bootcamp}/enroll', 'enroll')->name('bootcamps.enroll')->middleware('auth');
    Route::get('bootcamps/payment/{enrollment}', 'payment')->name('bootcamps.payment')->middleware('auth');
    Route::post('bootcamps/payment/{enrollment}', 'processPayment')->name('bootcamps.payment.process')->middleware('auth');
    Route::get('my-bootcamps', 'myBootcamps')->name('bootcamps.my')->middleware('auth');
    Route::get('bootcamps/{bootcamp}/dashboard', 'dashboard')->name('bootcamps.dashboard')->middleware('auth');
});

// Portfolio Routes
Route::controller(PortfolioController::class)->group(function () {
    Route::get('portfolio', 'index')->name('portfolio.index');
    Route::get('portfolio/{portfolio:slug}', 'show')->name('portfolio.show');
    Route::get('portfolio/my', 'myPortfolio')->name('portfolio.my')->middleware('auth');
    Route::get('portfolio/create', 'create')->name('portfolio.create')->middleware('auth');
    Route::post('portfolio', 'store')->name('portfolio.store')->middleware('auth');
    Route::get('portfolio/{portfolio}/edit', 'edit')->name('portfolio.edit')->middleware('auth');
    Route::put('portfolio/{portfolio}', 'update')->name('portfolio.update')->middleware('auth');
    Route::post('portfolio/{portfolio}/add-project', 'addProject')->name('portfolio.add-project')->middleware('auth');
    Route::put('portfolio/{portfolio}/project/{projectId}', 'updateProject')->name('portfolio.update-project')->middleware('auth');
    Route::delete('portfolio/{portfolio}/project/{projectId}', 'deleteProject')->name('portfolio.delete-project')->middleware('auth');
    Route::post('portfolio/{portfolio}/toggle-visibility', 'toggleVisibility')->name('portfolio.toggle-visibility')->middleware('auth');
});

// Alumni Routes
Route::controller(AlumniController::class)->group(function () {
    Route::get('alumni', 'index')->name('alumni.index');
    Route::get('alumni/{alumni}', 'show')->name('alumni.show');
    Route::get('alumni/achievements', 'achievements')->name('alumni.achievements');
    Route::get('alumni/companies', 'companies')->name('alumni.companies');
    Route::get('alumni/stats', 'stats')->name('alumni.stats');
    Route::post('alumni/submit-achievement', 'submitAchievement')->name('alumni.submit-achievement')->middleware('auth');
    Route::get('alumni/my-achievements', 'myAchievements')->name('alumni.my-achievements')->middleware('auth');
    Route::get('alumni/achievement/{achievement}/edit', 'editAchievement')->name('alumni.edit-achievement')->middleware('auth');
    Route::put('alumni/achievement/{achievement}', 'updateAchievement')->name('alumni.update-achievement')->middleware('auth');
    Route::delete('alumni/achievement/{achievement}', 'deleteAchievement')->name('alumni.delete-achievement')->middleware('auth');
});

// Additional pages from codebasics.io
Route::get('challenges/resume-project-challenge', function () {
    return view('pages.challenges.resume-project');
})->name('challenges.resume-project');

Route::get('events', function () {
    return view('pages.events.index');
})->name('events.index');

Route::get('testimonials', function () {
    return view('pages.testimonials.index');
})->name('testimonials.index');

Route::get('alumni-achievements', function () {
    return view('pages.alumni-achievements.index');
})->name('alumni-achievements.index');

Route::get('hiring-partners', function () {
    return view('pages.hiring-partners.index');
})->name('hiring-partners.index');

Route::get('contact-us', function () {
    return view('pages.contact.index');
})->name('contact.index');

Route::post('contact-us', [ContactMessageController::class, 'store'])->name('contact.store');

/**
 * Ops endpoints (for hosts with no SSH/terminal).
 * Protect using OPS_TOKEN in backend .env.
 */
Route::get('__ops/migrate', function () {
    abort_unless(request('token') && hash_equals((string) env('OPS_TOKEN'), (string) request('token')), 403);

    Artisan::call('migrate', ['--force' => true]);

    return response()->json([
        'ok' => true,
        'output' => Artisan::output(),
    ]);
});

Route::get('__ops/schema.sql', function () {
    abort_unless(request('token') && hash_equals((string) env('OPS_TOKEN'), (string) request('token')), 403);

    // Generates SQL statements for all pending migrations without executing them.
    Artisan::call('migrate', ['--pretend' => true]);

    return response(Artisan::output(), 200, [
        'Content-Type' => 'text/plain; charset=UTF-8',
        'Content-Disposition' => 'attachment; filename=\"schema.sql\"',
    ]);
});

Route::get('refund-policy', function () {
    return view('pages.refund-policy');
})->name('refund-policy');

Route::get('terms-and-conditions', function () {
    return view('pages.terms');
})->name('terms');

Route::get('privacy-policy', function () {
    return view('pages.privacy-policy');
})->name('privacy-policy');

Route::get('certificate_validation', function () {
    return view('pages.certificate-validation');
})->name('certificate-validation');
