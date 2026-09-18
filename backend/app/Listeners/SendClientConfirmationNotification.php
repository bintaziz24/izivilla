<?php

namespace App\Listeners;

use App\Events\PropertyRequestCreated;
use App\Models\Notification;

class SendClientConfirmationNotification
{
    public function handle(PropertyRequestCreated $event): void
    {
        $req = $event->request;
        $req->loadMissing('property');

        $propertyTitle = $req->property ? $req->property->title : 'le bien';
        $location = $req->property ? ($req->property->quartier . ' – ' . $req->property->city) : '';
        $fullTitle = $propertyTitle . ($location ? ' – ' . $location : '');

        Notification::create([
            'recipient_email' => $req->client_email,
            'title' => '✅ Confirmation de votre demande',
            'message' => "Bonjour {$req->client_name},\n\nvotre demande concernant {$fullTitle} a bien été transmise à l'annonceur.\n\nVous serez contacté prochainement.",
            'type' => 'REQUEST_CONFIRMATION',
            'link' => '/espace-locataire?tab=requests',
            'is_read' => false,
            'data' => [
                'request_id' => $req->id,
                'property_id' => $req->property_id,
            ],
        ]);
    }
}
