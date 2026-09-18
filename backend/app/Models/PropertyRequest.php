<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'client_name',
        'client_email',
        'client_phone',
        'advertiser_email',
        'message',
        'status',
        'is_reminder_sent',
    ];

    protected $casts = [
        'is_reminder_sent' => 'boolean',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
