<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agency_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo_url')->nullable();
            $table->string('phone_whatsapp');
            $table->string('email');
            $table->string('city')->default('Dakar');
            $table->string('address')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_verified')->default(true);
            $table->integer('active_listings_count')->default(0);
            $table->string('subscription_tier')->default('Freemium'); // Freemium, Pro, Enterprise
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agency_profiles');
    }
};
