<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_name',
        'action',
        'target_type',
        'target_id',
        'details',
        'ip_address'
    ];
}
