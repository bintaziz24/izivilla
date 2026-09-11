<?php

namespace App\Http\Controllers;

use App\Models\AgencyProfile;
use Illuminate\Http\Request;

class AgencyController extends Controller
{
    public function index()
    {
        $agencies = AgencyProfile::withCount('properties')->get();
        return response()->json($agencies);
    }

    public function show($id)
    {
        $agency = AgencyProfile::with(['properties.images'])->findOrFail($id);
        return response()->json($agency);
    }
}
