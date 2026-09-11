<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_alerts', function (Blueprint $table) {
            $table->id();
            $table->string('user_email');
            $table->string('city')->nullable();
            $table->string('quartier')->nullable();
            $table->string('property_type')->nullable();
            $table->integer('max_price')->nullable();
            $table->boolean('is_furnished')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_alerts');
    }
};
