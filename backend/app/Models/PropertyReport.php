<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'reporter_name',
        'reporter_email',
        'reporter_phone',
        'reason',
        'details',
        'status',
        'action_taken',
        'admin_notes'
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
