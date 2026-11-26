<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengaturan_tokos', function (Blueprint $table) {
            $table->string('hero_badge', 100)->nullable()->after('catatan_pembayaran');
            $table->string('hero_judul', 150)->nullable()->after('hero_badge');
            $table->string('hero_subjudul', 255)->nullable()->after('hero_judul');
            $table->string('hero_cta_text', 60)->nullable()->after('hero_subjudul');
            $table->string('hero_cta_url', 255)->nullable()->after('hero_cta_text');
        });
    }

    public function down(): void
    {
        Schema::table('pengaturan_tokos', function (Blueprint $table) {
            $table->dropColumn([
                'hero_badge',
                'hero_judul',
                'hero_subjudul',
                'hero_cta_text',
                'hero_cta_url',
            ]);
        });
    }
};