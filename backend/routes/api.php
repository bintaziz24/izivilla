<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\AgencyController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\BoostController;
use App\Http\Controllers\PropertyAlertController;

/*
|--------------------------------------------------------------------------
| TerangaImmo API Routes
|--------------------------------------------------------------------------
*/

Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/stats', [PropertyController::class, 'stats']);
Route::get('/properties/{id}', [PropertyController::class, 'show']);
Route::post('/properties', [PropertyController::class, 'store']);

Route::get('/agencies', [AgencyController::class, 'index']);
Route::get('/agencies/{id}', [AgencyController::class, 'show']);

Route::post('/appointments', [AppointmentController::class, 'store']);
Route::get('/appointments', [AppointmentController::class, 'index']);

Route::post('/boosts/checkout', [BoostController::class, 'checkout']);

Route::get('/alerts', [PropertyAlertController::class, 'index']);
Route::post('/alerts', [PropertyAlertController::class, 'store']);
Route::delete('/alerts/{id}', [PropertyAlertController::class, 'destroy']);

