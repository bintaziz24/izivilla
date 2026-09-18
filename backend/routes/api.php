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

Route::post('/appointments', [AppointmentController::class, 'store']);
Route::get('/appointments', [AppointmentController::class, 'index']);
Route::patch('/appointments/{id}/status', [AppointmentController::class, 'updateStatus']);
Route::post('/appointments/send-reminders', [AppointmentController::class, 'sendReminders']);

Route::post('/boosts/checkout', [BoostController::class, 'checkout']);

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


