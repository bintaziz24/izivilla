<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgencyProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'logo_url',
        'phone_whatsapp',
        'email',
        'city',
        'address',
        'description',
        'is_verified',
        'active_listings_count',
        'subscription_tier',
    ];

    public function properties()
    {
        return $this->hasMany(Property::class);
    }
}
