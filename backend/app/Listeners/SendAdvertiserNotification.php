<?php

namespace App\Listeners;

use App\Events\PropertyRequestCreated;
use App\Models\Notification;

class SendAdvertiserNotification
{
    public function handle(PropertyRequestCreated $event): void
    {
        $req = $event->request;
        $req->loadMissing('property');

        $propertyTitle = $req->property ? $req->property->title : 'Votre annonce';
        $location = $req->property ? ($req->property->quartier . ' – ' . $req->property->city) : '';
        $fullTitle = $propertyTitle . ($location ? ' – ' . $location : '');

        Notification::create([
            'recipient_email' => $req->advertiser_email,
            'title' => '🔔 Nouvelle demande sur votre annonce',
            'message' => "{$fullTitle}\nClient : {$req->client_name}\n« {$req->message} »",
            'type' => 'NEW_REQUEST',
            'link' => '/espace-proprietaire',
            'is_read' => false,
            'data' => [
                'request_id' => $req->id,
                'property_id' => $req->property_id,
                'client_email' => $req->client_email,
                'client_phone' => $req->client_phone,
            ],
        ]);
    }
}
