<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->string('tenant_name');
            $table->string('tenant_email');
            $table->string('tenant_phone');
            $table->string('advertiser_email')->nullable();
            $table->dateTime('preferred_date');
            $table->dateTime('rescheduled_date')->nullable();
            $table->text('message')->nullable();
            $table->text('advertiser_comment')->nullable();
            $table->string('status')->default('pending'); // pending, confirmed, rescheduled, cancelled
            $table->boolean('reminder_24h_sent')->default(false);
            $table->boolean('reminder_2h_sent')->default(false);
            $table->timestamps();
        });

        Schema::create('boosts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->string('plan_name'); // Boost 3 jours, Boost 7 jours, Premium 30 jours
            $table->integer('duration_days');
            $table->integer('amount_fcfa');
            $table->string('payment_method'); // Wave, Orange Money, Card, Free Money
            $table->string('payment_phone')->nullable();
            $table->string('transaction_reference')->unique();
            $table->string('status')->default('completed'); // pending, completed, failed
            $table->dateTime('starts_at');
            $table->dateTime('expires_at');
            $table->timestamps();
        });

        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->string('user_session_token');
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('boosts');
        Schema::dropIfExists('appointments');
    }
};
