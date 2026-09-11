<?php

namespace App\Http\Controllers;

use App\Models\PropertyAlert;
use Illuminate\Http\Request;

class PropertyAlertController extends Controller
{
    public function index(Request $request)
    {
        $query = PropertyAlert::query();

        if ($request->filled('email')) {
            $query->where('user_email', $request->email);
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_email' => 'required|email',
            'city' => 'nullable|string',
            'quartier' => 'nullable|string',
            'property_type' => 'nullable|string',
            'max_price' => 'nullable|numeric',
            'is_furnished' => 'nullable|boolean',
        ]);

        $alert = PropertyAlert::create($validated);

        return response()->json([
            'message' => 'Alerte email enregistrée avec succès ! Vous recevrez des notifications pour les nouveaux biens correspondants.',
            'alert' => $alert,
        ], 201);
    }

    public function destroy($id)
    {
        $alert = PropertyAlert::findOrFail($id);
        $alert->delete();

        return response()->json([
            'message' => 'Alerte supprimée avec succès.',
        ]);
    }
}
