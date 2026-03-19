<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BootcampEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'bootcamp_id',
        'user_id',
        'enrolled_at',
        'completed_at',
        'status',
        'payment_status',
        'amount_paid',
        'payment_method',
        'transaction_id',
        'progress_percentage',
        'certificate_issued',
        'certificate_url',
        'portfolio_url',
        'notes',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'completed_at' => 'datetime',
        'amount_paid' => 'decimal:2',
        'progress_percentage' => 'integer',
        'certificate_issued' => 'boolean',
    ];

    public function bootcamp(): BelongsTo
    {
        return $this->belongsTo(Bootcamp::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getFormattedAmountPaidAttribute()
    {
        return number_format($this->amount_paid, 2);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeDropped($query)
    {
        return $query->where('status', 'dropped');
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }
}
