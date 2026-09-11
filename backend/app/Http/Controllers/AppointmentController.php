<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Property;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'tenant_name' => 'required|string|max:255',
            'tenant_email' => 'required|email',
            'tenant_phone' => 'required|string',
            'preferred_date' => 'required|date',
            'message' => 'nullable|string',
        ]);

        $appointment = Appointment::create($validated);

        return response()->json([
            'message' => 'Votre demande de visite a été envoyée avec succès à l\'agence !',
            'appointment' => $appointment->load('property'),
        ], 201);
    }

    public function index(Request $request)
    {
        $query = Appointment::with(['property.agency', 'property.images']);

        if ($request->filled('tenant_email')) {
            $query->where('tenant_email', $request->tenant_email);
        }

        $appointments = $query->latest()->get();
        return response()->json($appointments);
    }
}
