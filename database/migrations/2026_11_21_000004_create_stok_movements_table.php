<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Catat setiap perubahan stok bahan baku maupun porsi menu siap jual.
     */
    public function up(): void
    {
        Schema::create('stok_movements', function (Blueprint $table): void {
            $table->id();
            $table->string('jenis', 10);
            $table->string('sumber', 30);
            $table->foreignId('bahan_baku_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('masakan_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('jumlah', 12, 2);
            $table->string('satuan', 20)->nullable();
            $table->decimal('harga_satuan', 12, 2)->nullable();
            $table->string('keterangan', 255)->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->index(['bahan_baku_id', 'created_at']);
            $table->index(['masakan_id', 'created_at']);
            $table->index('order_id');
            $table->index(['sumber', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stok_movements');
    }
};
