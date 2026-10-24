<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Property;
use App\Models\VerificationRequest;
use App\Models\PropertyReport;
use App\Models\AdminActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * 1. Tableau de bord général : Métriques réelles, actions prioritaires et dernières annonces
     */
    public function dashboardStats(Request $request): JsonResponse
    {
        $totalUsers = User::count();
        $totalOwnersAndAgencies = User::whereIn('role', ['owner', 'agency'])->count();
        
        $totalPublishedProperties = Property::whereIn('status', ['available', 'published'])->count();
        $pendingProperties = Property::where('status', 'pending')->count();
        
        $pendingVerifications = VerificationRequest::where('status', 'pending')->count();
        $pendingReports = PropertyReport::whereIn('status', ['pending', 'in_progress'])->count();

        // Actions urgentes à traiter
        $urgentVerifications = VerificationRequest::where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->limit(4)
            ->get();

        $urgentReports = PropertyReport::with(['property' => function($q) {
                $q->select('id', 'title', 'city', 'quartier', 'price_fcfa', 'status');
            }])
            ->whereIn('status', ['pending', 'in_progress'])
            ->orderBy('created_at', 'desc')
            ->limit(4)
            ->get();

        // Dernières annonces publiées ou soumises
        $recentProperties = Property::with(['images' => function($q) {
                $q->orderBy('is_primary', 'desc');
            }])
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        // Derniers logs d'activité
        $recentLogs = AdminActivityLog::orderBy('created_at', 'desc')->limit(6)->get();

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'total_owners_agencies' => $totalOwnersAndAgencies,
                'total_published_properties' => $totalPublishedProperties,
                'pending_properties' => $pendingProperties,
                'pending_verifications' => $pendingVerifications,
                'pending_reports' => $pendingReports,
            ],
            'urgent_verifications' => $urgentVerifications,
            'urgent_reports' => $urgentReports,
            'recent_properties' => $recentProperties,
            'recent_logs' => $recentLogs
        ]);
    }

    /**
     * 2. Gestion des annonces immobilières
     */
    public function properties(Request $request): JsonResponse
    {
        $query = Property::with(['images', 'agency']);

        // Recherche par mot-clé
        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->where(function($q) use ($search) {
                $q->where('title', 'ILIKE', $search)
                  ->orWhere('city', 'ILIKE', $search)
                  ->orWhere('quartier', 'ILIKE', $search)
                  ->orWhere('owner_name', 'ILIKE', $search)
                  ->orWhere('owner_email', 'ILIKE', $search);
            });
        }

        // Filtre par statut
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filtre par ville
        if ($request->filled('city') && $request->city !== 'all') {
            $query->where('city', 'ILIKE', '%' . $request->city . '%');
        }

        // Filtre par type de bien
        if ($request->filled('property_type') && $request->property_type !== 'all') {
            $query->where('property_type', $request->property_type);
        }

        // Filtre par transaction
        if ($request->filled('transaction_type') && $request->transaction_type !== 'all') {
            $query->where('transaction_type', $request->transaction_type);
        }

        $perPage = (int)$request->get('per_page', 12);
        $properties = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($properties);
    }

    /**
     * Modifier le statut d'une annonce (valider, suspendre, rétablir)
     */
    public function updatePropertyStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:available,pending,suspended,rented,sold'
        ]);

        $property = Property::findOrFail($id);
        $oldStatus = $property->status;
        $property->status = $validated['status'];
        $property->save();

        AdminActivityLog::create([
            'admin_name' => $request->header('X-Admin-Name', 'Super Admin'),
            'action' => 'PROPERTY_STATUS_CHANGE',
            'target_type' => 'property',
            'target_id' => $property->id,
            'details' => "Statut de l'annonce #{$property->id} « {$property->title} » modifié de {$oldStatus} à {$validated['status']}.",
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => "Le statut de l'annonce a été mis à jour avec succès.",
            'property' => $property
        ]);
    }

    /**
     * Supprimer une annonce
     */
    public function deleteProperty(Request $request, $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $title = $property->title;
        $property->delete();

        AdminActivityLog::create([
            'admin_name' => $request->header('X-Admin-Name', 'Super Admin'),
            'action' => 'PROPERTY_DELETED',
            'target_type' => 'property',
            'target_id' => $id,
            'details' => "Suppression définitive de l'annonce #{$id} : « {$title} ».",
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => "L'annonce a été supprimée avec succès."
        ]);
    }

    /**
     * 3. Gestion des utilisateurs
     */
    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->where(function($q) use ($search) {
                $q->where('name', 'ILIKE', $search)
                  ->orWhere('email', 'ILIKE', $search)
                  ->orWhere('phone', 'ILIKE', $search);
            });
        }

        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        $perPage = (int)$request->get('per_page', 15);
        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Activer / Suspendre ou modifier un compte utilisateur
     */
    public function updateUser(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'is_active' => 'nullable|boolean',
            'is_verified' => 'nullable|boolean',
            'role' => 'nullable|string|in:user,tenant,owner,agency,admin'
        ]);

        if (isset($validated['is_active'])) {
            $user->is_active = $validated['is_active'];
        }
        if (isset($validated['is_verified'])) {
            $user->is_verified = $validated['is_verified'];
        }
        if (isset($validated['role'])) {
            $user->role = $validated['role'];
        }

        $user->save();

        AdminActivityLog::create([
            'admin_name' => $request->header('X-Admin-Name', 'Super Admin'),
            'action' => 'USER_UPDATED',
            'target_type' => 'user',
            'target_id' => $user->id,
            'details' => "Mise à jour du compte de {$user->name} ({$user->email}) - Actif: " . ($user->is_active ? 'Oui' : 'Non') . ", Rôle: {$user->role}.",
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => "Le compte utilisateur a été mis à jour.",
            'user' => $user
        ]);
    }

    /**
     * 4. Vérification des propriétaires et des agences
     */
    public function verifications(Request $request): JsonResponse
    {
        $query = VerificationRequest::with('user');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $verifications = $query->orderBy('created_at', 'desc')->get();

        return response()->json($verifications);
    }

    public function approveVerification(Request $request, $id): JsonResponse
    {
        $verification = VerificationRequest::findOrFail($id);
        $verification->status = 'approved';
        $verification->reviewed_by = $request->header('X-Admin-Name', 'Super Admin');
        $verification->reviewed_at = Carbon::now();
        $verification->save();

        // Attribuer le badge à l'utilisateur s'il existe
        if ($verification->user_id) {
            User::where('id', $verification->user_id)->update(['is_verified' => true]);
        }

        // Marquer toutes ses annonces comme vérifiées
        Property::where('owner_email', $verification->user_email)
            ->orWhere('owner_name', $verification->user_name)
            ->update(['is_verified' => true]);

        AdminActivityLog::create([
            'admin_name' => $request->header('X-Admin-Name', 'Super Admin'),
            'action' => 'VERIFICATION_APPROVED',
            'target_type' => 'verification',
            'target_id' => $verification->id,
            'details' => "Attribution du badge Vérifié à « {$verification->user_name} » ({$verification->document_type}).",
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => "Badge accordé avec succès ! Les annonces de {$verification->user_name} affichent désormais le label officiel Vérifié.",
            'verification' => $verification
        ]);
    }

    public function rejectVerification(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|min:5'
        ]);

        $verification = VerificationRequest::findOrFail($id);
        $verification->status = 'rejected';
        $verification->rejection_reason = $validated['reason'];
        $verification->reviewed_by = $request->header('X-Admin-Name', 'Super Admin');
        $verification->reviewed_at = Carbon::now();
        $verification->save();

        AdminActivityLog::create([
            'admin_name' => $request->header('X-Admin-Name', 'Super Admin'),
            'action' => 'VERIFICATION_REJECTED',
            'target_type' => 'verification',
            'target_id' => $verification->id,
            'details' => "Demande de vérification de « {$verification->user_name} » refusée. Motif : {$validated['reason']}.",
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => "La demande de vérification a été rejetée avec motif transmis.",
            'verification' => $verification
        ]);
    }

    /**
     * 5. Gestion des signalements d'annonces
     */
    public function reports(Request $request): JsonResponse
    {
        $query = PropertyReport::with(['property.images']);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $reports = $query->orderBy('created_at', 'desc')->get();

        return response()->json($reports);
    }

    public function resolveReport(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:resolved,dismissed,in_progress',
            'action_taken' => 'nullable|string|in:property_suspended,dismissed,owner_warned',
            'admin_notes' => 'nullable|string'
        ]);

        $report = PropertyReport::findOrFail($id);
        $report->status = $validated['status'];
        $report->action_taken = $validated['action_taken'] ?? $report->action_taken;
        $report->admin_notes = $validated['admin_notes'] ?? $report->admin_notes;
        $report->save();

        // Si l'administrateur a choisi de suspendre l'annonce signalée
        if (($validated['action_taken'] ?? '') === 'property_suspended' && $report->property_id) {
            Property::where('id', $report->property_id)->update(['status' => 'suspended']);
        }

        AdminActivityLog::create([
            'admin_name' => $request->header('X-Admin-Name', 'Super Admin'),
            'action' => 'REPORT_RESOLVED',
            'target_type' => 'report',
            'target_id' => $report->id,
            'details' => "Signalement #{$report->id} traité : statut {$report->status}, action : {$report->action_taken}.",
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'success' => true,
            'message' => "Le signalement a été mis à jour avec succès.",
            'report' => $report
        ]);
    }

    /**
     * 6. Journal d'activité administrateur
     */
    public function activityLogs(Request $request): JsonResponse
    {
        $logs = AdminActivityLog::orderBy('created_at', 'desc')->paginate(20);
        return response()->json($logs);
    }

    /**
     * 7. Statistiques et rapports analytiques
     */
    public function advancedStats(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month'); // week, month, year

        // Répartition par ville
        $byCity = Property::select('city', DB::raw('count(*) as count'))
            ->groupBy('city')
            ->orderByDesc('count')
            ->limit(6)
            ->get();

        // Répartition par catégorie
        $byType = Property::select('property_type', DB::raw('count(*) as count'))
            ->groupBy('property_type')
            ->orderByDesc('count')
            ->get();

        // Vente vs Location
        $byTransaction = Property::select('transaction_type', DB::raw('count(*) as count'))
            ->groupBy('transaction_type')
            ->get();

        // Annonces les plus vues
        $topViewed = Property::with('images')
            ->orderBy('views_count', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'by_city' => $byCity,
            'by_type' => $byType,
            'by_transaction' => $byTransaction,
            'top_viewed' => $topViewed,
        ]);
    }
}
