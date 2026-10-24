<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Ajouter statuts de modération aux utilisateurs si absents
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('role');
            }
            if (!Schema::hasColumn('users', 'is_verified')) {
                $table->boolean('is_verified')->default(false)->after('is_active');
            }
        });

        // 2. Table des demandes de vérification (CNI, NINEA, Registre de commerce)
        if (!Schema::hasTable('verification_requests')) {
            Schema::create('verification_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('user_name');
                $table->string('user_email');
                $table->string('user_phone')->nullable();
                $table->string('user_type')->default('owner'); // 'owner', 'agency'
                $table->string('document_type')->default('cni'); // 'cni', 'ninea', 'rccm', 'titre_foncier'
                $table->string('document_number')->nullable();
                $table->text('document_url')->nullable();
                $table->string('status')->default('pending'); // 'pending', 'approved', 'rejected'
                $table->text('rejection_reason')->nullable();
                $table->string('reviewed_by')->nullable();
                $table->timestamp('reviewed_at')->nullable();
                $table->timestamps();
            });
        }

        // 3. Table des signalements d'annonces
        if (!Schema::hasTable('property_reports')) {
            Schema::create('property_reports', function (Blueprint $table) {
                $table->id();
                $table->foreignId('property_id')->nullable()->constrained('properties')->cascadeOnDelete();
                $table->string('reporter_name')->nullable();
                $table->string('reporter_email');
                $table->string('reporter_phone')->nullable();
                $table->string('reason'); // 'fausse_annonce', 'prix_trompeur', 'photos_volées', 'deja_vendu_loue', 'fraude'
                $table->text('details')->nullable();
                $table->string('status')->default('pending'); // 'pending', 'in_progress', 'resolved', 'dismissed'
                $table->string('action_taken')->nullable(); // 'property_suspended', 'owner_warned', 'dismissed'
                $table->text('admin_notes')->nullable();
                $table->timestamps();
            });
        }

        // 4. Table du journal d'activité administrateur
        if (!Schema::hasTable('admin_activity_logs')) {
            Schema::create('admin_activity_logs', function (Blueprint $table) {
                $table->id();
                $table->string('admin_name')->default('Admin Izivilla');
                $table->string('action'); // 'PROPERTY_APPROVED', 'PROPERTY_SUSPENDED', etc.
                $table->string('target_type'); // 'property', 'user', 'verification', 'report'
                $table->unsignedBigInteger('target_id')->nullable();
                $table->text('details')->nullable();
                $table->string('ip_address')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_activity_logs');
        Schema::dropIfExists('property_reports');
        Schema::dropIfExists('verification_requests');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'is_verified']);
        });
    }
};
