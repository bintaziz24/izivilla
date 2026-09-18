<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('property_alerts', function (Blueprint $table) {
            $table->string('transaction_type')->nullable()->after('property_type');
            $table->integer('bedrooms')->nullable()->after('transaction_type');
        });
    }

    public function down(): void
    {
        Schema::table('property_alerts', function (Blueprint $table) {
            $table->dropColumn(['transaction_type', 'bedrooms']);
        });
    }
};
