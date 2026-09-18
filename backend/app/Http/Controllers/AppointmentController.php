<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Property;
use App\Models\Notification;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'tenant_name' => 'required|string|max:255',
            'tenant_email' => 'required|email',
            'tenant_phone' => 'required|string',
            'preferred_date' => 'required|date',
            'message' => 'nullable|string',
        ]);

        $property = Property::with('agency')->findOrFail($validated['property_id']);
        $advertiserEmail = $property->owner_email ?: ($property->agency ? $property->agency->email : 'contact@izivilla.sn');

        $appointment = Appointment::create([
            'property_id' => $property->id,
            'tenant_name' => $validated['tenant_name'],
            'tenant_email' => $validated['tenant_email'],
            'tenant_phone' => $validated['tenant_phone'],
            'advertiser_email' => $advertiserEmail,
            'preferred_date' => $validated['preferred_date'],
            'message' => $validated['message'] ?? null,
            'status' => 'pending',
            'reminder_24h_sent' => false,
            'reminder_2h_sent' => false,
        ]);

        $formattedDate = Carbon::parse($appointment->preferred_date)->translatedFormat('l d F Y à H\hi');

        // 1. Notification pour l'Annonceur (Priorité 6)
        Notification::create([
            'recipient_email' => $advertiserEmail,
            'title' => '📅 Demande de visite reçue',
            'message' => "Demande de visite sur \"{$property->title}\"\nClient : {$appointment->tenant_name} ({$appointment->tenant_phone})\nDate souhaitée : {$formattedDate}\n« " . ($appointment->message ?: 'Souhaite effectuer une visite du bien.') . " »",
            'type' => 'VISIT_REQUEST',
            'link' => '/espace-proprietaire?tab=appointments',
            'is_read' => false,
            'data' => [
                'appointment_id' => $appointment->id,
                'property_id' => $property->id,
            ],
        ]);

        // 2. Notification de Confirmation pour le Client (Priorité 6)
        Notification::create([
            'recipient_email' => $appointment->tenant_email,
            'title' => '📅 Votre demande de visite a été transmise',
            'message' => "Bonjour {$appointment->tenant_name},\n\nvotre demande de visite concernant \"{$property->title}\" pour le {$formattedDate} a bien été transmise à l'annonceur. Vous recevrez une confirmation sous peu.",
            'type' => 'VISIT_SUBMITTED',
            'link' => '/espace-locataire?tab=appointments',
            'is_read' => false,
            'data' => [
                'appointment_id' => $appointment->id,
                'property_id' => $property->id,
            ],
        ]);

        return response()->json([
            'message' => 'Votre demande de visite a été transmise avec succès à l\'annonceur !',
            'appointment' => $appointment->load('property'),
        ], 201);
    }

    public function index(Request $request)
    {
        $query = Appointment::with(['property.agency', 'property.images']);

        if ($request->filled('tenant_email')) {
            $query->where('tenant_email', $request->tenant_email);
        }

        if ($request->filled('advertiser_email')) {
            $query->where('advertiser_email', $request->advertiser_email);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $appointments = $query->latest()->get();
        return response()->json($appointments);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'action' => 'required|string|in:accept,reschedule,refuse',
            'rescheduled_date' => 'nullable|date',
            'comment' => 'nullable|string',
        ]);

        $appointment = Appointment::with('property')->findOrFail($id);
        $action = $validated['action'];
        $propertyTitle = $appointment->property ? $appointment->property->title : 'le bien';
        $ownerName = $appointment->property ? ($appointment->property->owner_name ?: 'L\'annonceur') : 'L\'annonceur';

        if ($action === 'accept') {
            $appointment->status = 'confirmed';
            if ($validated['comment'] ?? null) {
                $appointment->advertiser_comment = $validated['comment'];
            }
            $appointment->save();

            $formattedDate = Carbon::parse($appointment->preferred_date)->translatedFormat('l d F Y à H\hi');

            // Notification pour le Client (Priorité 7)
            Notification::create([
                'recipient_email' => $appointment->tenant_email,
                'title' => '✅ Visite confirmée',
                'message' => "✅ Visite confirmée !\n📍 Bien : {$propertyTitle}\n📅 Date & Heure : {$formattedDate}\nAnnonceur : {$ownerName}",
                'type' => 'VISIT_CONFIRMED',
                'link' => '/espace-locataire?tab=appointments',
                'is_read' => false,
                'data' => [
                    'appointment_id' => $appointment->id,
                    'property_id' => $appointment->property_id,
                ],
            ]);

            // Notification pour l'Annonceur (Priorité 7)
            Notification::create([
                'recipient_email' => $appointment->advertiser_email,
                'title' => '✅ Visite confirmée enregistrée',
                'message' => "Vous avez accepté le rendez-vous de visite avec {$appointment->tenant_name} pour \"{$propertyTitle}\" prévu le {$formattedDate}.",
                'type' => 'VISIT_CONFIRMED',
                'link' => '/espace-proprietaire?tab=appointments',
                'is_read' => false,
                'data' => [
                    'appointment_id' => $appointment->id,
                    'property_id' => $appointment->property_id,
                ],
            ]);

            return response()->json([
                'message' => 'Visite confirmée avec succès !',
                'appointment' => $appointment
            ]);

        } elseif ($action === 'reschedule') {
            if (empty($validated['rescheduled_date'])) {
                return response()->json(['message' => 'Veuillez spécifier la nouvelle date proposée.'], 422);
            }

            $appointment->status = 'rescheduled';
            $appointment->rescheduled_date = $validated['rescheduled_date'];
            $appointment->advertiser_comment = $validated['comment'] ?? null;
            $appointment->save();

            $newDateFormatted = Carbon::parse($appointment->rescheduled_date)->translatedFormat('l d F Y à H\hi');

            // Notification pour le Client
            Notification::create([
                'recipient_email' => $appointment->tenant_email,
                'title' => '⏰ Nouvelle date proposée pour la visite',
                'message' => "L'annonceur a proposé un nouveau créneau pour le bien \"{$propertyTitle}\" :\n📅 Nouveau rendez-vous : {$newDateFormatted}" . ($appointment->advertiser_comment ? "\nCommentaire : {$appointment->advertiser_comment}" : ""),
                'type' => 'VISIT_RESCHEDULED',
                'link' => '/espace-locataire?tab=appointments',
                'is_read' => false,
                'data' => [
                    'appointment_id' => $appointment->id,
                    'rescheduled_date' => $appointment->rescheduled_date,
                ],
            ]);

            return response()->json([
                'message' => 'Nouvelle date de visite transmise au client.',
                'appointment' => $appointment
            ]);

        } elseif ($action === 'refuse') {
            $appointment->status = 'cancelled';
            $appointment->advertiser_comment = $validated['comment'] ?? null;
            $appointment->save();

            // Notification pour le Client
            Notification::create([
                'recipient_email' => $appointment->tenant_email,
                'title' => '❌ Demande de visite refusée',
                'message' => "Votre demande de visite pour le bien \"{$propertyTitle}\" n'a pas pu être acceptée par l'annonceur." . ($appointment->advertiser_comment ? "\nMotif : {$appointment->advertiser_comment}" : ""),
                'type' => 'VISIT_CANCELLED',
                'link' => '/espace-locataire?tab=appointments',
                'is_read' => false,
                'data' => [
                    'appointment_id' => $appointment->id,
                ],
            ]);

            return response()->json([
                'message' => 'Demande de visite déclinée.',
                'appointment' => $appointment
            ]);
        }
    }

    public function sendReminders()
    {
        $now = Carbon::now();
        $in24Hours = Carbon::now()->addHours(24);
        $in2Hours = Carbon::now()->addHours(2);

        // Fetch confirmed appointments that have not been reminded
        $confirmedAppointments = Appointment::with('property')
            ->where('status', 'confirmed')
            ->get();

        $count24h = 0;
        $count2h = 0;

        foreach ($confirmedAppointments as $apt) {
            $visitDate = Carbon::parse($apt->rescheduled_date ?: $apt->preferred_date);
            $propertyTitle = $apt->property ? $apt->property->title : 'votre bien';
            $formattedTime = $visitDate->translatedFormat('H\hi');

            // 24H Reminder Check (Priorité 8)
            if (!$apt->reminder_24h_sent && $visitDate->greaterThan($now) && $visitDate->lessThanOrEqualTo($in24Hours)) {
                $apt->reminder_24h_sent = true;
                $apt->save();

                // Client 24h Reminder
                Notification::create([
                    'recipient_email' => $apt->tenant_email,
                    'title' => '🔔 Rappel de visite (Demain)',
                    'message' => "🔔 Rappel : votre visite pour \"{$propertyTitle}\" est prévue demain à {$formattedTime}.",
                    'type' => 'VISIT_REMINDER',
                    'link' => '/espace-locataire?tab=appointments',
                    'is_read' => false,
                    'data' => ['appointment_id' => $apt->id],
                ]);

                // Advertiser 24h Reminder
                Notification::create([
                    'recipient_email' => $apt->advertiser_email,
                    'title' => '🔔 Rappel de visite annonceur (Demain)',
                    'message' => "🔔 Rappel : Vous avez une visite prévue demain à {$formattedTime} avec {$apt->tenant_name} pour \"{$propertyTitle}\".",
                    'type' => 'VISIT_REMINDER',
                    'link' => '/espace-proprietaire?tab=appointments',
                    'is_read' => false,
                    'data' => ['appointment_id' => $apt->id],
                ]);

                $count24h++;
            }

            // 2H Reminder Check (Priorité 8)
            if (!$apt->reminder_2h_sent && $visitDate->greaterThan($now) && $visitDate->lessThanOrEqualTo($in2Hours)) {
                $apt->reminder_2h_sent = true;
                $apt->save();

                // Client 2h Reminder
                Notification::create([
                    'recipient_email' => $apt->tenant_email,
                    'title' => '🕐 Visite dans 2 heures',
                    'message' => "🕐 Votre visite pour \"{$propertyTitle}\" est prévue dans 2 heures (à {$formattedTime}).",
                    'type' => 'VISIT_REMINDER',
                    'link' => '/espace-locataire?tab=appointments',
                    'is_read' => false,
                    'data' => ['appointment_id' => $apt->id],
                ]);

                // Advertiser 2h Reminder
                Notification::create([
                    'recipient_email' => $apt->advertiser_email,
                    'title' => '🕐 Visite dans 2 heures',
                    'message' => "🕐 Votre visite avec {$apt->tenant_name} pour \"{$propertyTitle}\" débute dans 2 heures (à {$formattedTime}).",
                    'type' => 'VISIT_REMINDER',
                    'link' => '/espace-proprietaire?tab=appointments',
                    'is_read' => false,
                    'data' => ['appointment_id' => $apt->id],
                ]);

                $count2h++;
            }
        }

        return response()->json([
            'message' => "Rappels de visites traités avec succès.",
            'reminders_24h_sent' => $count24h,
            'reminders_2h_sent' => $count2h,
        ]);
    }
}

