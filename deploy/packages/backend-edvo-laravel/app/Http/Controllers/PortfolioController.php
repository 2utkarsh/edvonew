<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Models\BootcampEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PortfolioController extends Controller
{
    public function index()
    {
        $portfolios = Portfolio::with(['user', 'bootcamp'])
            ->where('is_public', true)
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return view('portfolios.index', compact('portfolios'));
    }

    public function show(Portfolio $portfolio)
    {
        if (!$portfolio->is_public && (!auth()->user() || auth()->id() !== $portfolio->user_id)) {
            abort(404);
        }

        $portfolio->load(['user', 'bootcamp', 'projects']);

        return view('portfolios.show', compact('portfolio'));
    }

    public function myPortfolio()
    {
        $user = auth()->user();
        
        $portfolio = Portfolio::where('user_id', $user->id)
            ->with(['projects', 'bootcamp'])
            ->first();

        if (!$portfolio) {
            // Create portfolio if it doesn't exist
            $enrollment = BootcampEnrollment::where('user_id', $user->id)
                ->whereHas('bootcamp', function ($query) {
                    $query->where('portfolio_website_included', true);
                })
                ->first();

            if ($enrollment) {
                $portfolio = Portfolio::create([
                    'user_id' => $user->id,
                    'bootcamp_id' => $enrollment->bootcamp_id,
                    'title' => $user->name . "'s Portfolio",
                    'slug' => Str::slug($user->name) . '-portfolio',
                    'is_public' => false,
                ]);
            }
        }

        return view('portfolios.my-portfolio', compact('portfolio'));
    }

    public function create()
    {
        $user = auth()->user();
        
        // Check if user has completed a bootcamp with portfolio website included
        $eligibleBootcamps = BootcampEnrollment::where('user_id', $user->id)
            ->where('status', 'completed')
            ->whereHas('bootcamp', function ($query) {
                $query->where('portfolio_website_included', true);
            })
            ->with('bootcamp')
            ->get();

        if ($eligibleBootcamps->isEmpty()) {
            return back()->with('error', 'You need to complete a bootcamp that includes portfolio website access.');
        }

        return view('portfolios.create', compact('eligibleBootcamps'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'bootcamp_id' => 'required|exists:bootcamps,id',
            'title' => 'required|string|max:255',
            'bio' => 'required|string|max:1000',
            'skills' => 'required|array',
            'experience_years' => 'nullable|integer|min:0',
            'linkedin_url' => 'nullable|url',
            'github_url' => 'nullable|url',
            'website_url' => 'nullable|url',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'resume_file' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'is_public' => 'boolean',
        ]);

        $user = auth()->user();
        
        // Check if user already has a portfolio
        if (Portfolio::where('user_id', $user->id)->exists()) {
            return back()->with('error', 'You already have a portfolio. Please edit it instead.');
        }

        $data = $request->all();
        $data['user_id'] = $user->id;
        $data['slug'] = Str::slug($request->title) . '-' . uniqid();

        // Handle file uploads
        if ($request->hasFile('profile_image')) {
            $data['profile_image'] = $request->file('profile_image')->store('portfolios', 'public');
        }

        if ($request->hasFile('resume_file')) {
            $data['resume_file'] = $request->file('resume_file')->store('resumes', 'public');
        }

        Portfolio::create($data);

        return redirect()->route('portfolio.my')
            ->with('success', 'Portfolio created successfully!');
    }

    public function edit(Portfolio $portfolio)
    {
        if (auth()->id() !== $portfolio->user_id) {
            abort(403);
        }

        $portfolio->load(['projects']);

        return view('portfolios.edit', compact('portfolio'));
    }

    public function update(Request $request, Portfolio $portfolio)
    {
        if (auth()->id() !== $portfolio->user_id) {
            abort(403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'bio' => 'required|string|max:1000',
            'skills' => 'required|array',
            'experience_years' => 'nullable|integer|min:0',
            'linkedin_url' => 'nullable|url',
            'github_url' => 'nullable|url',
            'website_url' => 'nullable|url',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'resume_file' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'is_public' => 'boolean',
        ]);

        $data = $request->all();
        $data['slug'] = Str::slug($request->title) . '-' . uniqid();

        // Handle file uploads
        if ($request->hasFile('profile_image')) {
            if ($portfolio->profile_image) {
                Storage::disk('public')->delete($portfolio->profile_image);
            }
            $data['profile_image'] = $request->file('profile_image')->store('portfolios', 'public');
        }

        if ($request->hasFile('resume_file')) {
            if ($portfolio->resume_file) {
                Storage::disk('public')->delete($portfolio->resume_file);
            }
            $data['resume_file'] = $request->file('resume_file')->store('resumes', 'public');
        }

        $portfolio->update($data);

        return redirect()->route('portfolio.my')
            ->with('success', 'Portfolio updated successfully!');
    }

    public function addProject(Request $request, Portfolio $portfolio)
    {
        if (auth()->id() !== $portfolio->user_id) {
            abort(403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'technologies' => 'required|array',
            'project_url' => 'nullable|url',
            'github_url' => 'nullable|url',
            'demo_url' => 'nullable|url',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'featured' => 'boolean',
        ]);

        $projectData = [
            'title' => $request->title,
            'description' => $request->description,
            'technologies' => $request->technologies,
            'project_url' => $request->project_url,
            'github_url' => $request->github_url,
            'demo_url' => $request->demo_url,
            'featured' => $request->boolean('featured', false),
        ];

        // Handle image uploads
        $images = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $images[] = $image->store('portfolio-projects', 'public');
            }
        }
        $projectData['images'] = $images;

        $portfolio->projects()->create($projectData);

        return back()->with('success', 'Project added to portfolio!');
    }

    public function updateProject(Request $request, Portfolio $portfolio, $projectId)
    {
        if (auth()->id() !== $portfolio->user_id) {
            abort(403);
        }

        $project = $portfolio->projects()->findOrFail($projectId);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'technologies' => 'required|array',
            'project_url' => 'nullable|url',
            'github_url' => 'nullable|url',
            'demo_url' => 'nullable|url',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'featured' => 'boolean',
        ]);

        $projectData = [
            'title' => $request->title,
            'description' => $request->description,
            'technologies' => $request->technologies,
            'project_url' => $request->project_url,
            'github_url' => $request->github_url,
            'demo_url' => $request->demo_url,
            'featured' => $request->boolean('featured', false),
        ];

        // Handle image uploads
        if ($request->hasFile('images')) {
            // Delete old images
            foreach ($project->images ?? [] as $oldImage) {
                Storage::disk('public')->delete($oldImage);
            }

            $images = [];
            foreach ($request->file('images') as $image) {
                $images[] = $image->store('portfolio-projects', 'public');
            }
            $projectData['images'] = $images;
        }

        $project->update($projectData);

        return back()->with('success', 'Project updated successfully!');
    }

    public function deleteProject(Portfolio $portfolio, $projectId)
    {
        if (auth()->id() !== $portfolio->user_id) {
            abort(403);
        }

        $project = $portfolio->projects()->findOrFail($projectId);

        // Delete project images
        foreach ($project->images ?? [] as $image) {
            Storage::disk('public')->delete($image);
        }

        $project->delete();

        return back()->with('success', 'Project deleted successfully!');
    }

    public function toggleVisibility(Portfolio $portfolio)
    {
        if (auth()->id() !== $portfolio->user_id) {
            abort(403);
        }

        $portfolio->update([
            'is_public' => !$portfolio->is_public
        ]);

        return back()->with('success', 'Portfolio visibility updated!');
    }

    public function adminIndex()
    {
        $portfolios = Portfolio::with(['user', 'bootcamp'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return view('admin.portfolios.index', compact('portfolios'));
    }

    public function adminShow(Portfolio $portfolio)
    {
        $portfolio->load(['user', 'bootcamp', 'projects']);

        return view('admin.portfolios.show', compact('portfolio'));
    }

    public function adminToggleVisibility(Portfolio $portfolio)
    {
        $portfolio->update([
            'is_public' => !$portfolio->is_public
        ]);

        return back()->with('success', 'Portfolio visibility updated!');
    }
}
