<?php

namespace App\Http\Controllers;

use App\Models\Boost;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class BoostController extends Controller
{
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'plan_name' => 'required|string',
            'duration_days' => 'required|integer|min:1',
            'amount_fcfa' => 'required|numeric|min:100',
            'payment_method' => 'required|string', // Wave, Orange Money, Free Money, Card
            'payment_phone' => 'nullable|string',
        ]);

        $property = Property::findOrFail($validated['property_id']);

        $ref = strtoupper($validated['payment_method']) . '-' . Str::random(8);

        $startsAt = Carbon::now();
        $expiresAt = Carbon::now()->addDays($validated['duration_days']);

        $boost = Boost::create([
            'property_id' => $property->id,
            'plan_name' => $validated['plan_name'],
            'duration_days' => $validated['duration_days'],
            'amount_fcfa' => $validated['amount_fcfa'],
            'payment_method' => $validated['payment_method'],
            'payment_phone' => $validated['payment_phone'] ?? '+221 77 000 00 00',
            'transaction_reference' => $ref,
            'status' => 'completed',
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,
        ]);

        // Update Property boost status
        $property->update([
            'is_boosted' => true,
            'boosted_until' => $expiresAt,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Paiement effectué avec succès via ' . $validated['payment_method'] . ' ! Votre annonce est désormais sponsorisée.',
            'transaction_reference' => $ref,
            'boost' => $boost,
            'property' => $property->fresh(),
        ]);
    }
}
