<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Boost extends Model
{
    protected $fillable = [
        'property_id',
        'plan_name',
        'duration_days',
        'amount_fcfa',
        'payment_method',
        'payment_phone',
        'transaction_reference',
        'status',
        'starts_at',
        'expires_at',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
