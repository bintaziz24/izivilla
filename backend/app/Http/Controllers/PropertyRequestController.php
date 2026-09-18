<?php

namespace App\Http\Controllers;

use App\Models\PropertyRequest;
use App\Models\Property;
use App\Events\PropertyRequestCreated;
use Illuminate\Http\Request;

class PropertyRequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'client_name' => 'required|string|max:255',
            'client_email' => 'required|email',
            'client_phone' => 'nullable|string',
            'message' => 'required|string',
        ]);

        $property = Property::findOrFail($validated['property_id']);
        $advertiserEmail = $property->owner_email ?: ($property->agency ? $property->agency->email : 'contact@izivilla.sn');

        $propertyRequest = PropertyRequest::create([
            'property_id' => $property->id,
            'client_name' => $validated['client_name'],
            'client_email' => $validated['client_email'],
            'client_phone' => $validated['client_phone'] ?? null,
            'advertiser_email' => $advertiserEmail,
            'message' => $validated['message'],
            'status' => 'NOUVEAU',
            'is_reminder_sent' => false,
        ]);

        // Dispatch Event to send Notification to advertiser automatically
        event(new PropertyRequestCreated($propertyRequest));

        return response()->json([
            'message' => 'Votre demande a bien été envoyée à l\'annonceur !',
            'request' => $propertyRequest->load('property'),
        ], 201);
    }

    public function index(Request $request)
    {
        $query = PropertyRequest::with(['property.images', 'property.agency']);

        if ($request->filled('advertiser_email')) {
            $query->where('advertiser_email', $request->advertiser_email);
        }

        if ($request->filled('client_email')) {
            $query->where('client_email', $request->client_email);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->latest()->get();
        return response()->json($requests);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:NOUVEAU,CONTACTÉ,INTÉRESSÉ,VISITE,NÉGOCIATION,CONCLU,PERDU,ANNULÉ'
        ]);

        $propertyRequest = PropertyRequest::with('property')->findOrFail($id);
        $propertyRequest->status = $validated['status'];
        $propertyRequest->save();

        // Create Status Update Notification for Client (Étape C)
        \App\Models\Notification::create([
            'recipient_email' => $propertyRequest->client_email,
            'title' => '📌 Statut de votre demande mis à jour : ' . $validated['status'],
            'message' => 'L\'annonceur a mis à jour le statut de votre demande concernant "' . ($propertyRequest->property ? $propertyRequest->property->title : 'votre demande') . '" en "' . $validated['status'] . '".',
            'type' => 'STATUS_UPDATE',
            'link' => '/mes-demandes',
            'is_read' => false,
            'data' => [
                'request_id' => $propertyRequest->id,
                'status' => $validated['status'],
            ],
        ]);

        return response()->json([
            'message' => 'Statut mis à jour avec succès.',
            'request' => $propertyRequest
        ]);
    }

    public function sendReminders()
    {
        $pendingRequests = PropertyRequest::with('property')
            ->where('status', 'NOUVEAU')
            ->where('is_reminder_sent', false)
            ->get();

        $count = 0;
        foreach ($pendingRequests as $req) {
            $req->is_reminder_sent = true;
            $req->save();

            // Create Reminder Notification for Advertiser (Étape D)
            \App\Models\Notification::create([
                'recipient_email' => $req->advertiser_email,
                'title' => '⏰ Rappel : Demande client en attente de réponse',
                'message' => 'Rappel Izivilla : Vous avez une demande sans réponse de ' . $req->client_name . ' (' . ($req->client_phone ?: 'Téléphone non renseigné') . ') pour le bien "' . ($req->property ? $req->property->title : 'Votre annonce') . '".',
                'type' => 'REQUEST_REMINDER',
                'link' => '/espace-proprietaire?tab=requests',
                'is_read' => false,
                'data' => [
                    'request_id' => $req->id,
                    'property_id' => $req->property_id,
                ],
            ]);
            $count++;
        }

        return response()->json([
            'message' => "Rappels automatiques envoyés avec succès à {$count} annonceur(s).",
            'reminders_sent' => $count
        ]);
    }

    public function sendFollowup(Request $request, $id)
    {
        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $propertyRequest = PropertyRequest::with('property')->findOrFail($id);
        $propertyRequest->touch(); // updates updated_at timestamp to now

        // Create Notification for Client (Étape F - Priorité 10)
        \App\Models\Notification::create([
            'recipient_email' => $propertyRequest->client_email,
            'title' => '💬 Message de l\'annonceur concernant votre demande',
            'message' => $validated['message'],
            'type' => 'PROSPECT_FOLLOWUP',
            'link' => '/espace-locataire?tab=requests',
            'is_read' => false,
            'data' => [
                'request_id' => $propertyRequest->id,
                'property_id' => $propertyRequest->property_id,
            ],
        ]);

        return response()->json([
            'message' => 'Relance envoyée avec succès au prospect !',
            'request' => $propertyRequest
        ]);
    }
}
