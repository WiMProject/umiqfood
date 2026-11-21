<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Catatan uang keluar. Pembelian bahan menyimpan qty dan harga satuan
     * sebagai snapshot agar riwayat biaya tidak berubah saat harga acuan diedit.
     */
    public function up(): void
    {
        Schema::create('pengeluarans', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->string('kategori', 30);
            $table->string('deskripsi', 150)->nullable();
            $table->unsignedBigInteger('jumlah');
            $table->foreignId('bahan_baku_id')
                ->nullable()
                ->constrained('bahan_bakus')
                ->nullOnDelete();
            $table->decimal('qty', 12, 2)->nullable();
            $table->decimal('harga_satuan', 12, 2)->nullable();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();

            $table->index(['tanggal', 'kategori']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengeluarans');
    }
};
