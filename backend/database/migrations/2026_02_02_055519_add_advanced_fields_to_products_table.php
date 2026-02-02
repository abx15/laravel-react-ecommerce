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
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('original_price', 10, 2)->nullable()->after('price'); // The MRP
            $table->integer('discount_percentage')->default(0)->after('original_price');
            $table->decimal('rating', 3, 2)->default(0.00)->after('is_active');
            $table->integer('reviews_count')->default(0)->after('rating');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['original_price', 'discount_percentage', 'rating', 'reviews_count']);
        });
    }
};
