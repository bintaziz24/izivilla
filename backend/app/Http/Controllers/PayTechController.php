<?php

namespace App\Http\Controllers;

use App\Models\Boost;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PayTechController extends Controller
{
    /**
     * Initisaliser un paiement PayTech (Wave / Orange Money)
     */
    public function initiatePayment(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'amount_fcfa' => 'required|numeric|min:100',
            'duration_days' => 'required|integer|min:1',
            'payment_method' => 'required|string', // Wave, Orange Money, Free Money
            'payment_phone' => 'nullable|string',
            'plan_name' => 'nullable|string',
        ]);

        $property = Property::findOrFail($validated['property_id']);
        $method = strtolower($validated['payment_method']);

        // Mapper le moyen de paiement pour PayTech API
        $targetMode = 'wave';
        if (str_contains($method, 'orange') || str_contains($method, 'om')) {
            $targetMode = 'om';
        } elseif (str_contains($method, 'free')) {
            $targetMode = 'free_money';
        }

        $planName = $validated['plan_name'] ?? ('Boost ' . $validated['duration_days'] . ' jours');
        $refCommand = 'IZI-PAYTECH-' . strtoupper(Str::random(10));
        $amount = (int) $validated['amount_fcfa'];

        $apiKey = config('services.paytech.api_key', env('PAYTECH_API_KEY', 'test_api_key_izivilla'));
        $apiSecret = config('services.paytech.secret_key', env('PAYTECH_SECRET_KEY', 'test_secret_key_izivilla'));
        $paytechEnv = config('services.paytech.env', env('PAYTECH_ENV', 'test'));
        $paytechUrl = config('services.paytech.url', 'https://paytech.sn/api/payment/request-payment');

        $baseUrl = config('app.url', 'http://localhost:8000');
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:4200');

        $customPayload = json_encode([
            'property_id' => $property->id,
            'duration_days' => $validated['duration_days'],
            'amount_fcfa' => $amount,
            'payment_method' => $validated['payment_method'],
            'payment_phone' => $validated['payment_phone'] ?? '',
            'ref_command' => $refCommand,
        ]);

        $postParams = [
            'item_name' => 'IZIVILLA - ' . $planName,
            'item_price' => $amount,
            'currency' => 'XOF',
            'ref_command' => $refCommand,
            'command_name' => 'Sponsorisation Annonce #' . $property->id,
            'target_payment_mode' => $targetMode,
            'env' => $paytechEnv,
            'ipn_url' => $baseUrl . '/api/paytech/ipn',
            'success_url' => $frontendUrl . '/payment/success?ref=' . $refCommand,
            'cancel_url' => $frontendUrl . '/payment/cancel?ref=' . $refCommand,
            'custom_field' => $customPayload,
        ];

        // Créer l'enregistrement préliminaire du Boost en attente
        $startsAt = Carbon::now();
        $expiresAt = Carbon::now()->addDays($validated['duration_days']);

        $boost = Boost::create([
            'property_id' => $property->id,
            'plan_name' => $planName,
            'duration_days' => $validated['duration_days'],
            'amount_fcfa' => $amount,
            'payment_method' => $validated['payment_method'],
            'payment_phone' => $validated['payment_phone'] ?? '+221 77 000 00 00',
            'transaction_reference' => $refCommand,
            'status' => 'pending',
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,
        ]);

        try {
            // Appel à l'API officielle PayTech SN
            $response = Http::withHeaders([
                'API_KEY' => $apiKey,
                'API_SECRET' => $apiSecret,
                'Content-Type' => 'application/json',
            ])->post($paytechUrl, $postParams);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['success']) && ($data['success'] == 1 || $data['success'] === true)) {
                    return response()->json([
                        'success' => true,
                        'paytech_success' => true,
                        'redirect_url' => $data['redirect_url'] ?? ("https://paytech.sn/payment/checkout/" . ($data['token'] ?? '')),
                        'token' => $data['token'] ?? null,
                        'transaction_reference' => $refCommand,
                        'payment_method' => $validated['payment_method'],
                        'amount_fcfa' => $amount,
                        'message' => 'Demande de paiement PayTech générée avec succès !',
                        'boost' => $boost,
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::warning('PayTech API Call Warning: ' . $e->getMessage());
        }

        // Mode Démo / Fallback fluide si l'API PayTech est en test ou non configurée
        $demoRedirectUrl = "https://paytech.sn/payment/checkout/demo-" . strtolower($refCommand);

        return response()->json([
            'success' => true,
            'paytech_success' => false,
            'demo_mode' => true,
            'redirect_url' => $demoRedirectUrl,
            'transaction_reference' => $refCommand,
            'payment_method' => $validated['payment_method'],
            'amount_fcfa' => $amount,
            'message' => 'Lien de paiement PayTech (' . $validated['payment_method'] . ') préparé avec succès !',
            'boost' => $boost,
        ]);
    }

    /**
     * Notification IPN Webhook venant de PayTech
     */
    public function ipnCallback(Request $request)
    {
        $typeEvent = $request->input('type_event');
        $refCommand = $request->input('ref_command');
        $customField = $request->input('custom_field');

        Log::info('PayTech IPN Callback reçu', $request->all());

        if ($refCommand) {
            $boost = Boost::where('transaction_reference', $refCommand)->first();
            if ($boost) {
                $boost->update(['status' => 'completed']);

                $property = Property::find($boost->property_id);
                if ($property) {
                    $property->update([
                        'is_boosted' => true,
                        'boosted_until' => $boost->expires_at,
                    ]);
                }
            }
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Confirmation directe du paiement PayTech (Validation côté client/serveur)
     */
    public function confirmPayment(Request $request)
    {
        $ref = $request->input('transaction_reference') ?? $request->input('ref');
        if (!$ref) {
            return response()->json(['success' => false, 'message' => 'Référence PayTech manquante.'], 400);
        }

        $boost = Boost::where('transaction_reference', $ref)->first();
        if ($boost) {
            $boost->update(['status' => 'completed']);
            $property = Property::find($boost->property_id);
            if ($property) {
                $property->update([
                    'is_boosted' => true,
                    'boosted_until' => $boost->expires_at,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Paiement PayTech (' . $boost->payment_method . ') validé avec succès ! Votre annonce est boostée.',
                'transaction_reference' => $ref,
                'boost' => $boost,
                'property' => $property ? $property->fresh() : null,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Transaction PayTech introuvable.',
        ], 440);
    }
}
