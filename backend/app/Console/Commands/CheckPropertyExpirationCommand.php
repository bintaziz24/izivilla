<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Property;
use App\Models\Notification;
use Carbon\Carbon;

class CheckPropertyExpirationCommand extends Command
{
    protected $signature = 'izivilla:check-property-expiration';

    protected $description = 'Vérifie les annonces expirées (60j) et les annonces inactives (30j) puis envoie les notifications aux annonceurs.';

    public function handle()
    {
        $now = Carbon::now();
        $in7Days = Carbon::now()->addDays(7);
        $days30Ago = Carbon::now()->subDays(30);

        $expiredCount = 0;
        $expiringWarningCount = 0;
        $inactivityWarningCount = 0;

        // 1. Annonces à marquer comme expirées (expires_at <= NOW)
        $expiredProperties = Property::where('status', '!=', 'expired')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', $now)
            ->get();

        foreach ($expiredProperties as $property) {
            $property->status = 'expired';
            $property->save();

            $advertiserEmail = $property->owner_email ?: ($property->agency ? $property->agency->email : 'contact@izivilla.sn');

            Notification::create([
                'recipient_email' => $advertiserEmail,
                'title' => '⚠️ Votre annonce a expiré',
                'message' => "Votre annonce \"{$property->title}\" a atteint sa date d'expiration. Elle n'est plus visible dans les résultats publics. Vous pouvez la renouveler en 1 clic.",
                'type' => 'PROPERTY_EXPIRATION',
                'link' => '/espace-proprietaire?tab=properties',
                'is_read' => false,
                'data' => [
                    'property_id' => $property->id,
                    'action' => 'renew',
                ],
            ]);

            $expiredCount++;
        }

        // 2. Annonces arrivant bientôt à expiration (dans les 7 prochains jours)
        $expiringSoonProperties = Property::where('status', 'available')
            ->whereNotNull('expires_at')
            ->where('expires_at', '>', $now)
            ->where('expires_at', '<=', $in7Days)
            ->where('is_expiration_warning_sent', false)
            ->get();

        foreach ($expiringSoonProperties as $property) {
            $property->is_expiration_warning_sent = true;
            $property->save();

            $advertiserEmail = $property->owner_email ?: ($property->agency ? $property->agency->email : 'contact@izivilla.sn');
            $expiresFormatted = Carbon::parse($property->expires_at)->format('d/m/Y');

            Notification::create([
                'recipient_email' => $advertiserEmail,
                'title' => '⚠️ Votre annonce arrive bientôt à expiration',
                'message' => "Attention : Votre annonce \"{$property->title}\" expire le {$expiresFormatted}. Pensez à la renouveler pour conserver sa visibilité.",
                'type' => 'PROPERTY_EXPIRATION',
                'link' => '/espace-proprietaire?tab=properties',
                'is_read' => false,
                'data' => [
                    'property_id' => $property->id,
                    'action' => 'renew',
                ],
            ]);

            $expiringWarningCount++;
        }

        // 3. Annonces inactives (en ligne depuis 30 jours sans confirmation)
        $inactiveProperties = Property::where('status', 'available')
            ->where(function ($q) use ($days30Ago) {
                $q->whereNull('last_confirmed_at')->where('created_at', '<=', $days30Ago)
                  ->orWhere('last_confirmed_at', '<=', $days30Ago);
            })
            ->where('is_inactivity_warning_sent', false)
            ->get();

        foreach ($inactiveProperties as $property) {
            $property->is_inactivity_warning_sent = true;
            $property->save();

            $advertiserEmail = $property->owner_email ?: ($property->agency ? $property->agency->email : 'contact@izivilla.sn');

            Notification::create([
                'recipient_email' => $advertiserEmail,
                'title' => '🔔 Votre annonce est en ligne depuis 30 jours',
                'message' => "Bonjour, votre bien \"{$property->title}\" est-il toujours disponible ?\n\n- Toujours disponible\n- Loué / Vendu\n- Modifier l'annonce",
                'type' => 'PROPERTY_STATUS',
                'link' => '/espace-proprietaire?tab=properties',
                'is_read' => false,
                'data' => [
                    'property_id' => $property->id,
                    'action' => 'confirm_availability',
                ],
            ]);

            $inactivityWarningCount++;
        }

        $this->info("Expirées: {$expiredCount} | Pré-expirations: {$expiringWarningCount} | Inactives (30j): {$inactivityWarningCount}");
    }
}
