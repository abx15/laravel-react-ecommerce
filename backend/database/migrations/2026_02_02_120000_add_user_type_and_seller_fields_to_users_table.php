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
        Schema::table('users', function (Blueprint $table) {
            // Add role field for easier querying
            $table->string('user_type')->default('user')->after('email');
            // Add seller verification fields
            $table->boolean('is_seller_verified')->default(false)->after('is_blocked');
            $table->timestamp('seller_verified_at')->nullable()->after('is_seller_verified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['user_type', 'is_seller_verified', 'seller_verified_at']);
        });
    }
};
