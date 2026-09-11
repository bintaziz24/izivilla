<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PropertyAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_email',
        'city',
        'quartier',
        'property_type',
        'max_price',
        'is_furnished',
        'is_active',
    ];

    protected $casts = [
        'is_furnished' => 'boolean',
        'is_active' => 'boolean',
        'max_price' => 'integer',
    ];
}
