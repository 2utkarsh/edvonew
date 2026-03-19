<?php

namespace App\Http\Controllers;

use App\Models\Bootcamp;
use App\Models\BootcampEnrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BootcampController extends Controller
{
    public function index()
    {
        $bootcamps = Bootcamp::active()
            ->with(['instructor', 'category', 'reviews'])
            ->orderBy('featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return view('bootcamps.index', compact('bootcamps'));
    }

    public function show(Bootcamp $bootcamp)
    {
        $bootcamp->load(['instructor', 'category', 'lessons', 'projects', 'reviews.user']);
        
        $relatedBootcamps = Bootcamp::active()
            ->where('id', '!=', $bootcamp->id)
            ->where('category_id', $bootcamp->category_id)
            ->take(3)
            ->get();

        return view('bootcamps.show', compact('bootcamp', 'relatedBootcamps'));
    }

    public function enroll(Request $request, Bootcamp $bootcamp)
    {
        if (!$bootcamp->is_enrollment_open) {
            return back()->with('error', 'Enrollment is not open for this bootcamp.');
        }

        $user = auth()->user();
        
        // Check if already enrolled
        if ($bootcamp->students()->where('user_id', $user->id)->exists()) {
            return back()->with('error', 'You are already enrolled in this bootcamp.');
        }

        // Create enrollment
        $enrollment = BootcampEnrollment::create([
            'bootcamp_id' => $bootcamp->id,
            'user_id' => $user->id,
            'enrolled_at' => now(),
            'status' => 'active',
            'payment_status' => 'pending',
            'amount_paid' => $bootcamp->discount_price ?? $bootcamp->price,
        ]);

        return redirect()->route('bootcamps.payment', $enrollment->id)
            ->with('success', 'Please complete your payment to confirm enrollment.');
    }

    public function payment(BootcampEnrollment $enrollment)
    {
        if ($enrollment->user_id !== auth()->id()) {
            abort(403);
        }

        if ($enrollment->payment_status === 'paid') {
            return redirect()->route('bootcamps.show', $enrollment->bootcamp_id)
                ->with('success', 'You are already enrolled in this bootcamp!');
        }

        return view('bootcamps.payment', compact('enrollment'));
    }

    public function processPayment(Request $request, BootcampEnrollment $enrollment)
    {
        $request->validate([
            'payment_method' => 'required|in:stripe,paypal,razorpay',
        ]);

        if ($enrollment->user_id !== auth()->id()) {
            abort(403);
        }

        // Process payment based on method
        $paymentResult = $this->processPaymentMethod($request->payment_method, $enrollment);

        if ($paymentResult['success']) {
            $enrollment->update([
                'payment_status' => 'paid',
                'transaction_id' => $paymentResult['transaction_id'],
                'payment_method' => $request->payment_method,
            ]);

            // Update bootcamp enrollment count
            $enrollment->bootcamp->increment('current_enrollments');

            return redirect()->route('bootcamps.show', $enrollment->bootcamp_id)
                ->with('success', 'Enrollment successful! Welcome to the bootcamp.');
        }

        return back()->with('error', 'Payment failed. Please try again.');
    }

    private function processPaymentMethod($method, $enrollment)
    {
        // Implement payment processing logic here
        // This would integrate with Stripe, PayPal, RazorPay, etc.
        
        // For now, simulate successful payment
        return [
            'success' => true,
            'transaction_id' => 'txn_' . Str::random(20),
        ];
    }

    public function myBootcamps()
    {
        $user = auth()->user();
        $enrollments = $user->bootcampEnrollments()
            ->with('bootcamp.instructor')
            ->orderBy('enrolled_at', 'desc')
            ->paginate(10);

        return view('bootcamps.my-bootcamps', compact('enrollments'));
    }

    public function dashboard(Bootcamp $bootcamp)
    {
        $user = auth()->user();
        
        if (!$bootcamp->students()->where('user_id', $user->id)->exists()) {
            abort(403);
        }

        $enrollment = BootcampEnrollment::where('bootcamp_id', $bootcamp->id)
            ->where('user_id', $user->id)
            ->first();

        $bootcamp->load(['lessons', 'projects', 'assignments']);

        return view('bootcamps.dashboard', compact('bootcamp', 'enrollment'));
    }

    public function adminIndex()
    {
        $bootcamps = Bootcamp::with(['instructor', 'category'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return view('admin.bootcamps.index', compact('bootcamps'));
    }

    public function adminCreate()
    {
        $instructors = User::where('role', 'instructor')->get();
        $categories = CourseCategory::all();

        return view('admin.bootcamps.create', compact('instructors', 'categories'));
    }

    public function adminStore(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required',
            'short_description' => 'required|string|max:500',
            'instructor_id' => 'required|exists:users,id',
            'category_id' => 'required|exists:course_categories,id',
            'level' => 'required|in:beginner,intermediate,advanced',
            'duration_weeks' => 'required|integer|min:1',
            'live_sessions' => 'required|integer|min:0',
            'projects_count' => 'required|integer|min:0',
            'virtual_internships' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'start_date' => 'required|date|after:today',
            'end_date' => 'required|date|after:start_date',
            'enrollment_deadline' => 'nullable|date|before:start_date',
            'max_students' => 'required|integer|min:1',
            'requirements' => 'nullable|array',
            'what_you_learn' => 'nullable|array',
            'skills_gained' => 'nullable|array',
            'career_outcomes' => 'nullable|array',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'banner_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->all();
        $data['slug'] = Str::slug($request->title);
        $data['status'] = 'active';
        $data['current_enrollments'] = 0;

        // Handle image uploads
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('bootcamps', 'public');
        }

        if ($request->hasFile('banner_image')) {
            $data['banner_image'] = $request->file('banner_image')->store('bootcamps', 'public');
        }

        Bootcamp::create($data);

        return redirect()->route('admin.bootcamps.index')
            ->with('success', 'Bootcamp created successfully.');
    }

    public function adminEdit(Bootcamp $bootcamp)
    {
        $instructors = User::where('role', 'instructor')->get();
        $categories = CourseCategory::all();

        return view('admin.bootcamps.edit', compact('bootcamp', 'instructors', 'categories'));
    }

    public function adminUpdate(Request $request, Bootcamp $bootcamp)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required',
            'short_description' => 'required|string|max:500',
            'instructor_id' => 'required|exists:users,id',
            'category_id' => 'required|exists:course_categories,id',
            'level' => 'required|in:beginner,intermediate,advanced',
            'duration_weeks' => 'required|integer|min:1',
            'live_sessions' => 'required|integer|min:0',
            'projects_count' => 'required|integer|min:0',
            'virtual_internships' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'enrollment_deadline' => 'nullable|date|before:start_date',
            'max_students' => 'required|integer|min:1',
            'requirements' => 'nullable|array',
            'what_you_learn' => 'nullable|array',
            'skills_gained' => 'nullable|array',
            'career_outcomes' => 'nullable|array',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'banner_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->all();
        $data['slug'] = Str::slug($request->title);

        // Handle image uploads
        if ($request->hasFile('image')) {
            if ($bootcamp->image) {
                Storage::disk('public')->delete($bootcamp->image);
            }
            $data['image'] = $request->file('image')->store('bootcamps', 'public');
        }

        if ($request->hasFile('banner_image')) {
            if ($bootcamp->banner_image) {
                Storage::disk('public')->delete($bootcamp->banner_image);
            }
            $data['banner_image'] = $request->file('banner_image')->store('bootcamps', 'public');
        }

        $bootcamp->update($data);

        return redirect()->route('admin.bootcamps.index')
            ->with('success', 'Bootcamp updated successfully.');
    }

    public function adminDestroy(Bootcamp $bootcamp)
    {
        // Delete associated images
        if ($bootcamp->image) {
            Storage::disk('public')->delete($bootcamp->image);
        }
        if ($bootcamp->banner_image) {
            Storage::disk('public')->delete($bootcamp->banner_image);
        }

        $bootcamp->delete();

        return redirect()->route('admin.bootcamps.index')
            ->with('success', 'Bootcamp deleted successfully.');
    }
}
