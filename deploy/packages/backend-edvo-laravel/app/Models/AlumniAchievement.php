<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlumniAchievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bootcamp_id',
        'type',
        'company_name',
        'position',
        'description',
        'achievement_date',
        'image',
        'linkedin_url',
        'testimonial',
        'featured',
        'status',
        'salary_range',
        'location',
        'meta_title',
        'meta_description',
    ];

    protected $casts = [
        'achievement_date' => 'datetime',
        'featured' => 'boolean',
        'status' => 'string',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bootcamp(): BelongsTo
    {
        return $this->belongsTo(Bootcamp::class);
    }

    public function getFormattedDateAttribute()
    {
        return $this->achievement_date->format('F Y');
    }

    public function getTypeLabelAttribute()
    {
        return [
            'placement' => 'New Job',
            'promotion' => 'Promotion',
            'achievement' => 'Achievement',
            'other' => 'Other',
        ][$this->type] ?? 'Other';
    }

    public function getStatusLabelAttribute()
    {
        return [
            'pending' => 'Pending Review',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
        ][$this->status] ?? 'Unknown';
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByCompany($query, $company)
    {
        return $query->where('company_name', $company);
    }
}
