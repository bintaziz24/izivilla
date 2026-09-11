<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $fillable = [
        'property_id',
        'tenant_name',
        'tenant_email',
        'tenant_phone',
        'preferred_date',
        'message',
        'status',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
