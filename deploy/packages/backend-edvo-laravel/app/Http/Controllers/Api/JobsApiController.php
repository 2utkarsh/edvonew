<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobCircular;
use Illuminate\Http\Request;

class JobsApiController extends Controller
{
    public function index(Request $request)
    {
        $query = JobCircular::where('status', 'active');

        // Filter by type: 'remote' maps to work_type, others map to job_type
        if ($request->filled('type')) {
            $type = $request->type;
            if ($type === 'remote') {
                $query->where('work_type', 'remote');
            } else {
                $query->where('job_type', $type);
            }
        }

        // Filter by location (LIKE search)
        if ($request->filled('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        // Search in title, description, skills_required (JSON contains)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereJsonContains('skills_required', $search);
            });
        }

        // Filter by experience level
        if ($request->filled('experience')) {
            $query->where('experience_level', $request->experience);
        }

        // Default sort: created_at DESC
        $query->orderBy('created_at', 'desc');

        $jobs = $query->get();
        $data = $jobs->map(fn($job) => $this->mapJob($job));

        return response()->json([
            'success' => true,
            'data'    => $data,
            'count'   => $data->count(),
        ]);
    }

    private function mapJob(JobCircular $job): array
    {
        return [
            'id'                  => (string) $job->id,
            'title'               => $job->title ?? '',
            'company'             => $job->company ?? '',
            'logo'                => '/images/companies/' . ($job->slug ?? '') . '.png',
            'location'            => $job->location ?? '',
            'type'                => $job->work_type === 'remote' ? 'remote' : ($job->job_type ?? 'full-time'),
            'salary'              => $this->formatSalary($job),
            'description'         => $job->description ?? '',
            'requirements'        => $this->parseRequirements($job->description ?? ''),
            'skills'              => $job->skills_required ?? [],
            'experience'          => $job->experience_level ?? '',
            'postedDate'          => $job->created_at?->toISOString(),
            'applicationDeadline' => $job->application_deadline?->toISOString(),
            'applicants'          => $job->applicants ?? 0,
        ];
    }

    private function formatSalary(JobCircular $job): string
    {
        if ($job->salary_negotiable) {
            return 'Negotiable';
        }

        $min      = $job->salary_min;
        $max      = $job->salary_max;
        $currency = $job->salary_currency ?? 'USD';

        if ($min && $max) {
            return "{$currency} " . number_format($min) . " - " . number_format($max) . " LPA";
        }

        if ($min) {
            return "{$currency} " . number_format($min) . "+ LPA";
        }

        if ($max) {
            return "Up to {$currency} " . number_format($max) . " LPA";
        }

        return 'Not specified';
    }

    private function parseRequirements(string $description): array
    {
        if (empty($description)) {
            return [];
        }

        $lines = array_filter(
            array_map('trim', preg_split('/\r\n|\r|\n/', $description)),
            fn($line) => $line !== ''
        );

        $lines = array_values($lines);

        return count($lines) > 0 ? $lines : [$description];
    }
}
