<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Penanda menu yang ditampilkan di bagian "Pilihan Hari Ini".
     */
    public function up(): void
    {
        Schema::table('masakans', function (Blueprint $table) {
            $table->boolean('tampil_unggulan')
                ->default(false)
                ->after('tersedia');
        });
    }

    public function down(): void
    {
        Schema::table('masakans', function (Blueprint $table) {
            $table->dropColumn('tampil_unggulan');
        });
    }
};
