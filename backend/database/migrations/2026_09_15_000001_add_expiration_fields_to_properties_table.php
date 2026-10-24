<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            if (!Schema::hasColumn('properties', 'expires_at')) {
                $table->dateTime('expires_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('properties', 'last_confirmed_at')) {
                $table->dateTime('last_confirmed_at')->nullable()->after('expires_at');
            }
            if (!Schema::hasColumn('properties', 'is_expiration_warning_sent')) {
                $table->boolean('is_expiration_warning_sent')->default(false)->after('last_confirmed_at');
            }
            if (!Schema::hasColumn('properties', 'is_inactivity_warning_sent')) {
                $table->boolean('is_inactivity_warning_sent')->default(false)->after('is_expiration_warning_sent');
            }
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn([
                'expires_at',
                'last_confirmed_at',
                'is_expiration_warning_sent',
                'is_inactivity_warning_sent',
            ]);
        });
    }
};
