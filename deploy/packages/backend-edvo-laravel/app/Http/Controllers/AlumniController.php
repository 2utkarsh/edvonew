<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\BootcampEnrollment;
use App\Models\AlumniAchievement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AlumniController extends Controller
{
    public function index()
    {
        $achievements = AlumniAchievement::with(['user', 'bootcamp'])
            ->where('featured', true)
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        $stats = [
            'total_alumni' => User::where('role', 'student')
                ->whereHas('bootcampEnrollments', function ($query) {
                    $query->where('status', 'completed');
                })->count(),
            'placements' => AlumniAchievement::where('type', 'placement')->count(),
            'companies' => AlumniAchievement::distinct('company_name')->count('company_name'),
        ];

        return view('alumni.index', compact('achievements', 'stats'));
    }

    public function show(User $alumni)
    {
        $alumni->load([
            'bootcampEnrollments.bootcamp',
            'portfolio',
            'achievements'
        ]);

        return view('alumni.show', compact('alumni'));
    }

    public function achievements()
    {
        $achievements = AlumniAchievement::with(['user', 'bootcamp'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('alumni.achievements', compact('achievements'));
    }

    public function companies()
    {
        $companies = AlumniAchievement::whereNotNull('company_name')
            ->with(['user'])
            ->get()
            ->groupBy('company_name')
            ->map(function ($group) {
                return [
                    'name' => $group->first()->company_name,
                    'alumni_count' => $group->count(),
                    'positions' => $group->pluck('position')->unique()->values(),
                    'recent_alumni' => $group->take(3),
                ];
            })
            ->sortByDesc('alumni_count');

        return view('alumni.companies', compact('companies'));
    }

    public function submitAchievement(Request $request)
    {
        $request->validate([
            'type' => 'required|in:placement,promotion,achievement,other',
            'company_name' => 'required_if:type,placement,promotion',
            'position' => 'required_if:type,placement,promotion',
            'description' => 'required|string|max:1000',
            'achievement_date' => 'required|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'linkedin_url' => 'nullable|url',
            'testimonial' => 'nullable|string|max:2000',
        ]);

        $user = auth()->user();

        // Check if user is an alumni (completed bootcamp)
        $hasCompletedBootcamp = BootcampEnrollment::where('user_id', $user->id)
            ->where('status', 'completed')
            ->exists();

        if (!$hasCompletedBootcamp) {
            return back()->with('error', 'You must complete a bootcamp to submit achievements.');
        }

        $data = $request->all();
        $data['user_id'] = $user->id;

        // Handle image upload
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('alumni-achievements', 'public');
        }

        AlumniAchievement::create($data);

        return back()->with('success', 'Achievement submitted successfully! It will be reviewed by our team.');
    }

    public function myAchievements()
    {
        $user = auth()->user();
        
        $achievements = AlumniAchievement::where('user_id', $user->id)
            ->with('bootcamp')
            ->orderBy('created_at', 'desc')
            ->get();

        return view('alumni.my-achievements', compact('achievements'));
    }

    public function editAchievement(AlumniAchievement $achievement)
    {
        if (auth()->id() !== $achievement->user_id) {
            abort(403);
        }

        return view('alumni.edit-achievement', compact('achievement'));
    }

    public function updateAchievement(Request $request, AlumniAchievement $achievement)
    {
        if (auth()->id() !== $achievement->user_id) {
            abort(403);
        }

        $request->validate([
            'type' => 'required|in:placement,promotion,achievement,other',
            'company_name' => 'required_if:type,placement,promotion',
            'position' => 'required_if:type,placement,promotion',
            'description' => 'required|string|max:1000',
            'achievement_date' => 'required|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'linkedin_url' => 'nullable|url',
            'testimonial' => 'nullable|string|max:2000',
        ]);

        $data = $request->all();

        // Handle image upload
        if ($request->hasFile('image')) {
            if ($achievement->image) {
                Storage::disk('public')->delete($achievement->image);
            }
            $data['image'] = $request->file('image')->store('alumni-achievements', 'public');
        }

        $achievement->update($data);

        return redirect()->route('alumni.my-achievements')
            ->with('success', 'Achievement updated successfully!');
    }

    public function deleteAchievement(AlumniAchievement $achievement)
    {
        if (auth()->id() !== $achievement->user_id) {
            abort(403);
        }

        // Delete image
        if ($achievement->image) {
            Storage::disk('public')->delete($achievement->image);
        }

        $achievement->delete();

        return back()->with('success', 'Achievement deleted successfully!');
    }

    public function adminIndex()
    {
        $achievements = AlumniAchievement::with(['user', 'bootcamp'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('admin.alumni.index', compact('achievements'));
    }

    public function adminShow(AlumniAchievement $achievement)
    {
        $achievement->load(['user', 'bootcamp']);

        return view('admin.alumni.show', compact('achievement'));
    }

    public function adminToggleFeatured(AlumniAchievement $achievement)
    {
        $achievement->update([
            'featured' => !$achievement->featured
        ]);

        return back()->with('success', 'Achievement featured status updated!');
    }

    public function adminApprove(AlumniAchievement $achievement)
    {
        $achievement->update([
            'status' => 'approved'
        ]);

        return back()->with('success', 'Achievement approved!');
    }

    public function adminReject(AlumniAchievement $achievement)
    {
        $achievement->update([
            'status' => 'rejected'
        ]);

        return back()->with('success', 'Achievement rejected!');
    }

    public function adminDelete(AlumniAchievement $achievement)
    {
        // Delete image
        if ($achievement->image) {
            Storage::disk('public')->delete($achievement->image);
        }

        $achievement->delete();

        return back()->with('success', 'Achievement deleted successfully!');
    }

    public function stats()
    {
        $stats = [
            'total_alumni' => User::where('role', 'student')
                ->whereHas('bootcampEnrollments', function ($query) {
                    $query->where('status', 'completed');
                })->count(),
            'total_achievements' => AlumniAchievement::count(),
            'placements' => AlumniAchievement::where('type', 'placement')->count(),
            'promotions' => AlumniAchievement::where('type', 'promotion')->count(),
            'companies' => AlumniAchievement::distinct('company_name')->count('company_name'),
            'featured_achievements' => AlumniAchievement::where('featured', true)->count(),
        ];

        $recentAchievements = AlumniAchievement::with(['user', 'bootcamp'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        $topCompanies = AlumniAchievement::whereNotNull('company_name')
            ->selectRaw('company_name, COUNT(*) as count')
            ->groupBy('company_name')
            ->orderByDesc('count')
            ->take(10)
            ->get();

        return view('alumni.stats', compact('stats', 'recentAchievements', 'topCompanies'));
    }
}
