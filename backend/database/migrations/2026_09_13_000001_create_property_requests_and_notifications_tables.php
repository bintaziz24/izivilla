<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->string('client_name');
            $table->string('client_email');
            $table->string('client_phone')->nullable();
            $table->string('advertiser_email');
            $table->text('message');
            $table->string('status')->default('NOUVEAU'); // NOUVEAU, CONTACTÉ, INTÉRESSÉ, VISITE, NÉGOCIATION, CONCLU, PERDU, ANNULÉ
            $table->boolean('is_reminder_sent')->default(false);
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('recipient_email');
            $table->string('title');
            $table->text('message');
            $table->string('type')->default('NEW_REQUEST'); // NEW_REQUEST, REQUEST_CONFIRMATION, OWNER_REMINDER, VISIT_REQUEST, etc.
            $table->string('link')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->json('data')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('property_requests');
    }
};
