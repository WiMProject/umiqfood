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
        Schema::table('masakans', function (Blueprint $table) {
            // Jumlah porsi siap jual yang sudah dimasak
            $table->unsignedInteger('jumlah_porsi')->default(0)->after('tersedia');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('masakans', function (Blueprint $table) {
            $table->dropColumn('jumlah_porsi');
        });
    }
};
