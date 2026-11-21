<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('masakan_fotos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('masakan_id')
                ->constrained('masakans')
                ->cascadeOnDelete();
            $table->string('path');
            $table->unsignedInteger('urutan')->default(0);
            $table->timestamps();

            $table->index(['masakan_id', 'urutan']);
        });

        // Pindahkan foto lama (satu foto per menu) ke galeri agar tidak hilang.
        DB::table('masakans')
            ->whereNotNull('foto')
            ->orderBy('id')
            ->chunkById(100, function ($masakans) {
                $rows = [];

                foreach ($masakans as $masakan) {
                    $rows[] = [
                        'masakan_id' => $masakan->id,
                        'path' => $masakan->foto,
                        'urutan' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                if ($rows !== []) {
                    DB::table('masakan_fotos')->insert($rows);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('masakan_fotos');
    }
};
