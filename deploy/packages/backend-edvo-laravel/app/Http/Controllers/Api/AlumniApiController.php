<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AlumniAchievement;
use Illuminate\Http\Request;

class AlumniApiController extends Controller
{
    public function achievements(Request $request)
    {
        $achievements = AlumniAchievement::with(['user', 'bootcamp'])
            ->orderBy('featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $data = $achievements->map(fn($achievement) => [
            'id'               => $achievement->id,
            'type'             => $achievement->type,
            'company_name'     => $achievement->company_name,
            'position'         => $achievement->position,
            'description'      => $achievement->description,
            'testimonial'      => $achievement->testimonial,
            'featured'         => $achievement->featured,
            'achievement_date' => $achievement->achievement_date?->toISOString(),
            'user'             => $achievement->user ? [
                'id'    => $achievement->user->id,
                'name'  => $achievement->user->name,
                'email' => $achievement->user->email,
            ] : null,
            'bootcamp'         => $achievement->bootcamp ? [
                'id'    => $achievement->bootcamp->id,
                'title' => $achievement->bootcamp->title ?? null,
            ] : null,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $data,
            'count'   => $data->count(),
        ]);
    }

    public function stats()
    {
        $totalAlumni = AlumniAchievement::distinct('user_id')->count('user_id');
        $placements  = AlumniAchievement::where('type', 'placement')->count();
        $companies   = AlumniAchievement::whereNotNull('company_name')->distinct('company_name')->count('company_name');

        return response()->json([
            'success' => true,
            'data'    => [
                'total_alumni' => $totalAlumni,
                'placements'   => $placements,
                'companies'    => $companies,
            ],
        ]);
    }
}
