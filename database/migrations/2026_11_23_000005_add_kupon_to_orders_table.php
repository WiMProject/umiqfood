<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Simpan kupon dan nominal diskon pada pesanan supaya riwayat tetap utuh.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('kupon_id')
                ->nullable()
                ->after('metode_pembayaran')
                ->constrained('kupons')
                ->nullOnDelete();
            $table->string('kode_kupon', 30)
                ->nullable()
                ->after('kupon_id');
            $table->unsignedInteger('diskon')
                ->default(0)
                ->after('subtotal');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('kupon_id');
            $table->dropColumn(['kode_kupon', 'diskon']);
        });
    }
};
