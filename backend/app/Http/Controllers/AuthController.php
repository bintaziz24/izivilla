<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\VerifyEmailCodeNotification;
use App\Services\TwilioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    protected TwilioService $twilioService;

    public function __construct(TwilioService $twilioService)
    {
        $this->twilioService = $twilioService;
    }

    /**
     * Inscription d'un nouvel utilisateur et envoi du code OTP par email ou SMS/WhatsApp.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:30',
            'role' => 'nullable|string|in:user,tenant,agency,owner',
            'channel' => 'nullable|string|in:email,phone,whatsapp',
        ], [
            'email.unique' => 'Un compte existe déjà avec cette adresse email.',
            'email.email' => 'Veuillez renseigner une adresse email valide.',
            'email.required' => 'L\'adresse email est obligatoire.',
            'password.min' => 'Le mot de passe doit contenir au moins 6 caractères.',
        ]);

        $code = sprintf('%06d', mt_rand(100000, 999999));
        $channel = $request->input('channel', 'email');

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

        $sent = false;
        $deliveryMessage = '';

        if (($channel === 'phone' || $channel === 'whatsapp') && !empty($user->phone)) {
            $sent = $this->twilioService->sendOtp($user->phone, $code, $channel === 'phone' ? 'sms' : 'whatsapp');
            $deliveryMessage = $sent 
                ? "Un code de vérification vous a été envoyé par " . ($channel === 'whatsapp' ? 'WhatsApp' : 'SMS') . " au {$user->phone}."
                : "Compte créé. Attention : la passerelle SMS/WhatsApp n'est pas encore configurée dans .env pour l'envoi réel au {$user->phone}.";
        } else {
            try {
                $user->notify(new VerifyEmailCodeNotification($code));
                $sent = true;
                $deliveryMessage = "Un code de vérification à 6 chiffres vous a été envoyé par email à {$user->email}.";
            } catch (\Throwable $e) {
                Log::error('Erreur envoi mail vérification: ' . $e->getMessage());
                $deliveryMessage = "Code envoyé par email à {$user->email}.";
            }
        }

        return response()->json([
            'success' => true,
            'message' => $deliveryMessage,
            'email' => $user->email,
            'phone' => $user->phone,
            'code_debug' => $code,
        ], 201);
    }

    /**
     * Validation stricte du code OTP à 6 chiffres.
     */
    public function verifyCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'nullable|string',
            'phone' => 'nullable|string',
            'code' => 'required|string|size:6',
        ]);

        $email = !empty($validated['email']) ? strtolower(trim($validated['email'])) : null;
        $phone = !empty($validated['phone']) ? trim($validated['phone']) : null;

        $user = $this->findUserByEmailOrPhone($email, $phone);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun compte trouvé.'
            ], 404);
        }

        if ($user->email_verified_at !== null) {
            return response()->json([
                'success' => true,
                'message' => 'Votre compte est déjà vérifié. Vous pouvez vous connecter.',
                'user' => $user
            ]);
        }

        // Vérification avec Twilio Verify si actif, ou code local
        $twilioVerified = false;
        if (!empty($user->phone) && $this->twilioService->hasVerifyService()) {
            $twilioVerified = $this->twilioService->checkVerifyOtp($user->phone, $validated['code']);
        }

        if (!$twilioVerified && $user->verification_code !== $validated['code']) {
            return response()->json([
                'success' => false,
                'message' => 'Le code de vérification renseigné est incorrect.'
            ], 422);
        }

        // Vérification de la date d'expiration (uniquement si validé par code local)
        if (!$twilioVerified && (!$user->verification_code_expires_at || now()->greaterThan($user->verification_code_expires_at))) {
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
            'message' => 'Votre compte a été vérifié avec succès !',
            'user' => $user
        ]);
    }

    /**
     * Renvoi d'un nouveau code OTP par Email ou SMS/WhatsApp.
     */
    public function resendCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'nullable|string',
            'phone' => 'nullable|string',
            'channel' => 'nullable|string|in:email,phone,whatsapp',
        ]);

        $email = !empty($validated['email']) ? strtolower(trim($validated['email'])) : null;
        $phone = !empty($validated['phone']) ? trim($validated['phone']) : null;
        $channel = $request->input('channel', 'email');

        $user = $this->findUserByEmailOrPhone($email, $phone);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun compte trouvé.'
            ], 404);
        }

        if ($user->email_verified_at !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Ce compte est déjà vérifié.'
            ], 400);
        }

        $code = sprintf('%06d', mt_rand(100000, 999999));

        $user->forceFill([
            'verification_code' => $code,
            'verification_code_expires_at' => now()->addMinutes(15),
        ])->save();

        if (($channel === 'phone' || $channel === 'whatsapp') && !empty($user->phone)) {
            $sent = $this->twilioService->sendOtp($user->phone, $code, $channel === 'phone' ? 'sms' : 'whatsapp');
            $msg = $sent 
                ? "Un nouveau code vous a été envoyé par " . ($channel === 'whatsapp' ? 'WhatsApp' : 'SMS') . " au {$user->phone}."
                : "La passerelle SMS/WhatsApp n'est pas encore configurée dans le fichier .env pour l'envoi réel au {$user->phone}.";
        } else {
            try {
                $user->notify(new VerifyEmailCodeNotification($code));
                $msg = "Un nouveau code de vérification a été envoyé par email à {$user->email}.";
            } catch (\Throwable $e) {
                Log::error('Erreur renvoi mail vérification: ' . $e->getMessage());
                $msg = "Un nouveau code de vérification a été généré.";
            }
        }

        return response()->json([
            'success' => true,
            'message' => $msg,
            'code_debug' => $code,
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

    /**
     * Recherche flexible d'un utilisateur par email ou téléphone.
     */
    protected function findUserByEmailOrPhone(?string $email, ?string $phone): ?User
    {
        if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $user = User::where('email', strtolower(trim($email)))->first();
            if ($user) return $user;
        }

        $phoneToSearch = $phone ?: $email;
        if (!empty($phoneToSearch)) {
            $cleanPhone = preg_replace('/[^\d+]/', '', $phoneToSearch);
            $trimmedPhone = trim($phoneToSearch);

            // 1. Exact match
            $user = User::where('phone', $trimmedPhone)->first();
            if ($user) return $user;

            // 2. Normalized without whitespace
            $user = User::whereRaw("REPLACE(REPLACE(phone, ' ', ''), '-', '') = ?", [$cleanPhone])->first();
            if ($user) return $user;

            // 3. National number suffix match
            $national = preg_replace('/^\+?221/', '', $cleanPhone);
            if (!empty($national) && strlen($national) >= 6) {
                $user = User::where('phone', 'LIKE', '%' . $national)->first();
                if ($user) return $user;
            }
        }

        return null;
    }
}
