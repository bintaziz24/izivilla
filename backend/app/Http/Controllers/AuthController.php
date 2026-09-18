<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\VerifyEmailCodeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur et envoi du code OTP par email.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:30',
            'role' => 'nullable|string|in:user,tenant,agency,owner',
        ]);

        $code = sprintf('%06d', mt_rand(100000, 999999));

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'] ?? 'tenant',
            'verification_code' => $code,
            'verification_code_expires_at' => now()->addMinutes(15),
            'email_verified_at' => null,
        ]);

        // Envoi asynchrone / sécurisé de la notification mail avec le code OTP
        $mailSent = false;
        try {
            $user->notify(new VerifyEmailCodeNotification($code));
            $mailSent = true;
        } catch (\Throwable $e) {
            Log::error('Erreur envoi mail vérification: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => $mailSent 
                ? 'Inscription réussie ! Un code de vérification à 6 chiffres vous a été envoyé par email.' 
                : 'Inscription réussie ! Veuillez saisir votre code de vérification à 6 chiffres.',
            'email' => $user->email,
            'code_debug' => (config('app.debug') || config('mail.default') === 'log' || !$mailSent) ? $code : null,
        ], 201);
    }

    /**
     * Validation du code OTP à 6 chiffres.
     */
    public function verifyCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', strtolower(trim($validated['email'])))->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun compte trouvé avec cet email.'
            ], 404);
        }

        if ($user->email_verified_at !== null) {
            return response()->json([
                'success' => true,
                'message' => 'Votre adresse email est déjà vérifiée. Vous pouvez vous connecter.',
                'user' => $user
            ]);
        }

        if ($user->verification_code !== $validated['code']) {
            return response()->json([
                'success' => false,
                'message' => 'Le code de vérification renseigné est incorrect.'
            ], 422);
        }

        if (!$user->verification_code_expires_at || now()->greaterThan($user->verification_code_expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Le code de vérification a expiré. Veuillez demander un nouveau code.'
            ], 422);
        }

        // Valider l'email et réinitialiser le code
        $user->forceFill([
            'email_verified_at' => now(),
            'verification_code' => null,
            'verification_code_expires_at' => null,
        ])->save();

        return response()->json([
            'success' => true,
            'message' => 'Votre adresse email a été vérifiée avec succès !',
            'user' => $user
        ]);
    }

    /**
     * Renvoi d'un nouveau code OTP.
     */
    public function resendCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
        ]);

        $user = User::where('email', strtolower(trim($validated['email'])))->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun utilisateur trouvé avec cet email.'
            ], 404);
        }

        if ($user->email_verified_at !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Cet email est déjà vérifié.'
            ], 400);
        }

        $code = sprintf('%06d', mt_rand(100000, 999999));

        $user->forceFill([
            'verification_code' => $code,
            'verification_code_expires_at' => now()->addMinutes(15),
        ])->save();

        $mailSent = false;
        try {
            $user->notify(new VerifyEmailCodeNotification($code));
            $mailSent = true;
        } catch (\Throwable $e) {
            Log::error('Erreur renvoi mail vérification: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Un nouveau code de vérification a été généré.',
            'code_debug' => (config('app.debug') || config('mail.default') === 'log' || !$mailSent) ? $code : null,
        ]);
    }

    /**
     * Connexion de l'utilisateur.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', strtolower(trim($validated['email'])))->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Identifiants de connexion incorrects.'
            ], 401);
        }

        if ($user->email_verified_at === null) {
            return response()->json([
                'success' => false,
                'needs_verification' => true,
                'email' => $user->email,
                'message' => 'Votre compte n\'est pas encore vérifié. Veuillez saisir le code de validation.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie.',
            'user' => $user
        ]);
    }
}
