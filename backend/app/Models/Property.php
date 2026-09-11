<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'agency_profile_id',
        'title',
        'slug',
        'description',
        'property_type',
        'price_fcfa',
        'charges_included',
        'city',
        'quartier',
        'bedrooms',
        'bathrooms',
        'surface_sqm',
        'is_furnished',
        'has_air_con',
        'has_generator',
        'has_security',
        'has_parking',
        'has_pool',
        'latitude',
        'longitude',
        'status',
        'is_featured',
        'is_boosted',
        'boosted_until',
        'views_count',
        'transaction_type',
        'owner_type',
        'owner_name',
        'owner_phone',
        'owner_email',
        'is_verified',
        'equipments',
        'contact_phone',
        'contact_whatsapp',
    ];

    protected $casts = [
        'charges_included' => 'boolean',
        'is_furnished' => 'boolean',
        'has_air_con' => 'boolean',
        'has_generator' => 'boolean',
        'has_security' => 'boolean',
        'has_parking' => 'boolean',
        'has_pool' => 'boolean',
        'is_featured' => 'boolean',
        'is_boosted' => 'boolean',
        'is_verified' => 'boolean',
        'equipments' => 'array',
        'boosted_until' => 'datetime',
    ];


    public function agency()
    {
        return $this->belongsTo(AgencyProfile::class, 'agency_profile_id');
    }

    public function images()
    {
        return $this->hasMany(PropertyImage::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function boosts()
    {
        return $this->hasMany(Boost::class);
    }
}
