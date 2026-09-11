<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agency_profile_id')->nullable()->constrained('agency_profiles')->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('property_type'); // Studio, F2, F3, F4, Villa, Chambre meublée
            $table->integer('price_fcfa');
            $table->boolean('charges_included')->default(true);
            $table->string('city'); // Dakar, Thiès, Saly, Rufisque, etc.
            $table->string('quartier'); // Almadies, Mermoz, Plateau, VDN, Ngor, etc.
            $table->integer('bedrooms')->default(1);
            $table->integer('bathrooms')->default(1);
            $table->integer('surface_sqm')->nullable();
            $table->boolean('is_furnished')->default(false);
            $table->boolean('has_air_con')->default(false);
            $table->boolean('has_generator')->default(false);
            $table->boolean('has_security')->default(true);
            $table->boolean('has_parking')->default(false);
            $table->boolean('has_pool')->default(false);
            $table->double('latitude')->nullable();
            $table->double('longitude')->nullable();
            $table->string('status')->default('available'); // available, reserved, rented
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_boosted')->default(false);
            $table->dateTime('boosted_until')->nullable();
            $table->integer('views_count')->default(0);
            $table->string('transaction_type')->default('rent'); // rent, sale
            $table->string('owner_type')->default('Propriétaire'); // Propriétaire, Agence
            $table->string('owner_name')->nullable();
            $table->string('owner_phone')->nullable();
            $table->string('owner_email')->nullable();
            $table->boolean('is_verified')->default(true);
            $table->json('equipments')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_whatsapp')->nullable();
            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
