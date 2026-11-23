<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengaturanToko extends Model
{
    protected $fillable = [
        'nama_toko',
        'tagline',
        'alamat',
        'jam_buka',
        'jam_tutup',
        'hari_tutup',
        'whatsapp',
        'instagram',
        'maps_url',
        'catatan_pickup',
        'catatan_pembayaran',
    ];

    /**
     * Profil toko selalu satu baris. Buat baris awal bila belum ada.
     */
    public static function current(): self
    {
        return self::query()->firstOrCreate(
            ['id' => 1],
            [
                'nama_toko' => 'UmiqFood',
                'tagline' => 'Masakan rumahan, pesan tanpa repot.',
            ],
        );
    }
}
