<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TwilioService
{
    protected ?string $sid;
    protected ?string $token;
    protected ?string $fromSms;
    protected ?string $fromWhatsApp;

    public function __construct()
    {
        $this->sid = config('services.twilio.sid') ?: env('TWILIO_SID');
        $this->token = config('services.twilio.auth_token') ?: env('TWILIO_AUTH_TOKEN');
        $this->fromSms = config('services.twilio.phone_number') ?: env('TWILIO_PHONE_NUMBER');
        $this->fromWhatsApp = config('services.twilio.whatsapp_number') ?: env('TWILIO_WHATSAPP_NUMBER', '+14155238886');
    }

    /**
     * Nettoie et formate le numéro au standard international E.164 (+221...)
     */
    public function formatPhoneNumber(string $phone): string
    {
        $cleaned = preg_replace('/[^\d+]/', '', $phone);
        if (!str_starts_with($cleaned, '+')) {
            if (str_starts_with($cleaned, '221')) {
                $cleaned = '+' . $cleaned;
            } else {
                $cleaned = '+221' . ltrim($cleaned, '0');
            }
        }
        return $cleaned;
    }

    /**
     * Envoi du code OTP par SMS
     */
    public function sendSms(string $to, string $code): bool
    {
        if (empty($this->sid) || empty($this->token) || empty($this->fromSms)) {
            Log::warning("Twilio SMS non configuré dans .env (TWILIO_SID, TWILIO_AUTH_TOKEN ou TWILIO_PHONE_NUMBER). Code: {$code} pour {$to}");
            return false;
        }

        $formattedTo = $this->formatPhoneNumber($to);
        $message = "Votre code de vérification Izivilla est : {$code}. Valide pendant 15 minutes.";

        try {
            $response = Http::asForm()
                ->withBasicAuth($this->sid, $this->token)
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$this->sid}/Messages.json", [
                    'From' => $this->fromSms,
                    'To'   => $formattedTo,
                    'Body' => $message,
                ]);

            if ($response->successful()) {
                Log::info("SMS Twilio envoyé avec succès à {$formattedTo}");
                return true;
            }

            Log::error("Échec SMS Twilio à {$formattedTo}: " . $response->body());
            return false;
        } catch (\Throwable $e) {
            Log::error("Exception Twilio SMS: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Envoi du code OTP par WhatsApp
     */
    public function sendWhatsApp(string $to, string $code): bool
    {
        if (empty($this->sid) || empty($this->token)) {
            Log::warning("Twilio WhatsApp non configuré dans .env (TWILIO_SID ou TWILIO_AUTH_TOKEN manquant). Code: {$code} pour {$to}");
            return false;
        }

        $formattedTo = $this->formatPhoneNumber($to);
        $from = str_starts_with($this->fromWhatsApp, 'whatsapp:') ? $this->fromWhatsApp : 'whatsapp:' . $this->fromWhatsApp;
        $toWhatsApp = 'whatsapp:' . $formattedTo;
        $message = "Votre code de vérification Izivilla est : *{$code}*.\nCe code est valide pendant 15 minutes.";

        try {
            $response = Http::asForm()
                ->withBasicAuth($this->sid, $this->token)
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$this->sid}/Messages.json", [
                    'From' => $from,
                    'To'   => $toWhatsApp,
                    'Body' => $message,
                ]);

            if ($response->successful()) {
                Log::info("WhatsApp Twilio envoyé avec succès à {$toWhatsApp}");
                return true;
            }

            Log::error("Échec WhatsApp Twilio à {$toWhatsApp}: " . $response->body());
            return false;
        } catch (\Throwable $e) {
            Log::error("Exception Twilio WhatsApp: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Envoi selon le canal désiré (whatsapp ou sms)
     */
    public function sendOtp(string $to, string $code, string $preferredChannel = 'whatsapp'): bool
    {
        if ($preferredChannel === 'whatsapp') {
            $sent = $this->sendWhatsApp($to, $code);
            if (!$sent && !empty($this->fromSms)) {
                $sent = $this->sendSms($to, $code);
            }
            return $sent;
        }

        $sent = $this->sendSms($to, $code);
        if (!$sent) {
            $sent = $this->sendWhatsApp($to, $code);
        }
        return $sent;
    }
}
