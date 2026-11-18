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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('kode', 30)->unique();
            $table->date('tanggal');
            $table->unsignedInteger('nomor_antrian');
            $table->string('status', 20)->default('menunggu'); // menunggu, dimasak, siap, selesai, dibatalkan
            $table->string('metode_pembayaran', 20)->default('cash'); // cash, qris
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('total');
            $table->string('nama_pengambil', 100);
            $table->string('no_hp', 30);
            $table->text('catatan')->nullable();
            $table->timestamp('estimasi_siap_at')->nullable();
            $table->timestamp('siap_at')->nullable();
            $table->timestamp('diambil_at')->nullable();
            $table->timestamp('dibatalkan_at')->nullable();
            $table->timestamps();

            $table->unique(['tanggal', 'nomor_antrian']);
            $table->index(['user_id', 'status']);
            $table->index('tanggal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
