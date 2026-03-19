<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Bootcamp extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'short_description',
        'instructor_id',
        'category_id',
        'level',
        'duration_weeks',
        'live_sessions',
        'projects_count',
        'virtual_internships',
        'job_assistance',
        'price',
        'discount_price',
        'image',
        'banner_image',
        'video_url',
        'status',
        'featured',
        'start_date',
        'end_date',
        'enrollment_deadline',
        'max_students',
        'current_enrollments',
        'requirements',
        'what_you_learn',
        'skills_gained',
        'career_outcomes',
        'certificate_offered',
        'portfolio_website_included',
        'refund_policy',
        'payment_plans',
        'tags',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'enrollment_deadline' => 'datetime',
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'featured' => 'boolean',
        'job_assistance' => 'boolean',
        'certificate_offered' => 'boolean',
        'portfolio_website_included' => 'boolean',
        'requirements' => 'array',
        'what_you_learn' => 'array',
        'skills_gained' => 'array',
        'career_outcomes' => 'array',
        'payment_plans' => 'array',
        'tags' => 'array',
    ];

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CourseCategory::class, 'category_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(BootcampEnrollment::class);
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(BootcampLesson::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(BootcampAssignment::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(BootcampProject::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(BootcampReview::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'bootcamp_enrollments')
            ->withPivot(['enrolled_at', 'completed_at', 'status', 'payment_status', 'amount_paid'])
            ->withTimestamps();
    }

    public function getFormattedPriceAttribute()
    {
        return number_format($this->price, 2);
    }

    public function getFormattedDiscountPriceAttribute()
    {
        return $this->discount_price ? number_format($this->discount_price, 2) : null;
    }

    public function getDiscountPercentageAttribute()
    {
        if ($this->discount_price && $this->price > 0) {
            return round((($this->price - $this->discount_price) / $this->price) * 100);
        }
        return 0;
    }

    public function getIsEnrollmentOpenAttribute()
    {
        return $this->status === 'active' && 
               (!$this->enrollment_deadline || $this->enrollment_deadline > now()) &&
               $this->current_enrollments < $this->max_students;
    }

    public function getRemainingSlotsAttribute()
    {
        return max(0, $this->max_students - $this->current_enrollments);
    }

    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?: 0;
    }

    public function getTotalReviewsAttribute()
    {
        return $this->reviews()->count();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>', now());
    }

    public function scopeOngoing($query)
    {
        return $query->where('start_date', '<=', now())
                    ->where('end_date', '>=', now());
    }

    public function scopeCompleted($query)
    {
        return $query->where('end_date', '<', now());
    }
}
