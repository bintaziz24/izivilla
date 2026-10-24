<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\AgencyController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\BoostController;
use App\Http\Controllers\PropertyAlertController;

use App\Http\Controllers\PropertyRequestController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| TerangaImmo API Routes
|--------------------------------------------------------------------------
*/

// Auth Routes (Vérification par code OTP Email)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/register', [AuthController::class, 'register']);

Route::post('/auth/verify-code', [AuthController::class, 'verifyCode']);
Route::post('/verify-code', [AuthController::class, 'verifyCode']);

Route::post('/auth/resend-code', [AuthController::class, 'resendCode']);
Route::post('/resend-code', [AuthController::class, 'resendCode']);

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/login', [AuthController::class, 'login']);



Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/stats', [PropertyController::class, 'stats']);
Route::post('/properties/check-expirations', [PropertyController::class, 'checkExpirations']);
Route::get('/properties/{id}', [PropertyController::class, 'show']);
Route::post('/properties', [PropertyController::class, 'store']);
Route::patch('/properties/{id}/status', [PropertyController::class, 'updateStatus']);
Route::post('/properties/{id}/renew', [PropertyController::class, 'renew']);
Route::post('/properties/{id}/confirm-availability', [PropertyController::class, 'confirmAvailability']);

Route::get('/agencies', [AgencyController::class, 'index']);
Route::get('/agencies/{id}', [AgencyController::class, 'show']);

Route::get('/appointments/booked-slots', [AppointmentController::class, 'getBookedSlots']);
Route::post('/appointments', [AppointmentController::class, 'store']);
Route::get('/appointments', [AppointmentController::class, 'index']);
Route::patch('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
use App\Http\Controllers\PayTechController;

Route::post('/boosts/checkout', [BoostController::class, 'checkout']);
Route::post('/paytech/initiate', [PayTechController::class, 'initiatePayment']);
Route::post('/paytech/ipn', [PayTechController::class, 'ipnCallback']);
Route::post('/paytech/confirm', [PayTechController::class, 'confirmPayment']);

Route::get('/alerts', [PropertyAlertController::class, 'index']);
Route::post('/alerts', [PropertyAlertController::class, 'store']);
Route::patch('/alerts/{id}/toggle', [PropertyAlertController::class, 'toggleStatus']);
Route::delete('/alerts/{id}', [PropertyAlertController::class, 'destroy']);

// Izivilla Phase 1 Automations - Demandes & Notifications
Route::get('/property-requests', [PropertyRequestController::class, 'index']);
Route::post('/property-requests', [PropertyRequestController::class, 'store']);
Route::patch('/property-requests/{id}/status', [PropertyRequestController::class, 'updateStatus']);
Route::post('/property-requests/send-reminders', [PropertyRequestController::class, 'sendReminders']);
Route::post('/property-requests/{id}/send-followup', [PropertyRequestController::class, 'sendFollowup']);

Route::get('/notifications', [NotificationController::class, 'index']);
Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);

// -------------------------------------------------------------
// IZIVILLA Administration & Modération Routes
// -------------------------------------------------------------
Route::prefix('admin')->group(function () {
    // 1. Tableau de bord général
    Route::get('/dashboard-stats', [AdminController::class, 'dashboardStats']);
    Route::get('/stats', [AdminController::class, 'dashboardStats']);

    // 2. Gestion des annonces
    Route::get('/properties', [AdminController::class, 'properties']);
    Route::patch('/properties/{id}/status', [AdminController::class, 'updatePropertyStatus']);
    Route::delete('/properties/{id}', [AdminController::class, 'deleteProperty']);

    // 3. Gestion des utilisateurs
    Route::get('/users', [AdminController::class, 'users']);
    Route::patch('/users/{id}', [AdminController::class, 'updateUser']);

    // 4. Vérification des propriétaires et agences
    Route::get('/verifications', [AdminController::class, 'verifications']);
    Route::post('/verifications/{id}/approve', [AdminController::class, 'approveVerification']);
    Route::post('/verifications/{id}/reject', [AdminController::class, 'rejectVerification']);

    // 5. Gestion des signalements
    Route::get('/reports', [AdminController::class, 'reports']);
    Route::patch('/reports/{id}/resolve', [AdminController::class, 'resolveReport']);

    // 6. Journal d'activité & Notifications
    Route::get('/activity-logs', [AdminController::class, 'activityLogs']);

    // 7. Statistiques avancées
    Route::get('/advanced-stats', [AdminController::class, 'advancedStats']);
});



