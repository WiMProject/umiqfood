<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tandai apakah porsi menu untuk pesanan ini sudah benar-benar dipotong.
     * Pesanan lama sudah memotong porsi saat checkout, jadi di-backfill.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->boolean('porsi_dipotong')->default(false)->after('status');
        });

        DB::table('orders')
            ->where('status', '!=', 'dibatalkan')
            ->update(['porsi_dipotong' => true]);
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn('porsi_dipotong');
        });
    }
};
