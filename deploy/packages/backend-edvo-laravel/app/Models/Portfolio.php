<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Portfolio extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bootcamp_id',
        'title',
        'slug',
        'bio',
        'skills',
        'experience_years',
        'linkedin_url',
        'github_url',
        'website_url',
        'profile_image',
        'resume_file',
        'is_public',
        'views_count',
        'featured',
        'meta_title',
        'meta_description',
    ];

    protected $casts = [
        'skills' => 'array',
        'is_public' => 'boolean',
        'featured' => 'boolean',
        'views_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bootcamp(): BelongsTo
    {
        return $this->belongsTo(Bootcamp::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(PortfolioProject::class)->orderBy('featured', 'desc')->orderBy('created_at', 'desc');
    }

    public function getPublicUrlAttribute()
    {
        return route('portfolio.show', $this->slug);
    }

    public function getFormattedExperienceAttribute()
    {
        return $this->experience_years ? $this->experience_years . ' years' : 'Not specified';
    }

    public function getSkillsListAttribute()
    {
        return implode(', ', $this->skills ?? []);
    }

    public function incrementViews()
    {
        $this->increment('views_count');
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopePopular($query)
    {
        return $query->orderBy('views_count', 'desc');
    }
}
