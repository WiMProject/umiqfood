<?php

namespace Database\Seeders;

use App\Models\Masakan;
use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Ulasan contoh agar dialog menu langsung terasa hidup.
     */
    public function run(): void
    {
        $ulasans = [
            'Nasi Goreng Spesial Umiq' => [
                ['Rina Kurnia', 5, 'Nasi gorengnya mantap, bumbu meresap dan porsinya pas. Ambil sendiri juga cepat.'],
                ['Bagas Pratama', 4, 'Enak dan masih hangat pas diambil. Nomor antriannya jelas, tinggal tunggu dipanggil.'],
                ['Sari Melati', 5, 'Telur mata sapinya masih cair, favorit! Harga ramah untuk porsi segini.'],
                ['Dimas Saputra', 5, 'Sambalnya bisa minta dipisah, pelayanannya ramah. Pasti pesan lagi.'],
            ],
            'Ayam Geprek Sambal Korek' => [
                ['Nadia Putri', 5, 'Sambalnya nampol banget, buat pecinta pedas wajib coba. Ayamnya tetap krispi.'],
                ['Fajar Nugroho', 4, 'Ayamnya krispi dan lalapannya segar. Bisa minta sambal dipisah.'],
                ['Rina Kurnia', 5, 'Pedesnya pas, nasi hangatnya bikin nambah. Ambil di outlet juga tidak lama.'],
            ],
            'Es Teh Manis Jumbo' => [
                ['Intan Permata', 4, 'Segar dan tidak terlalu manis. Worth it untuk ukuran jumbo.'],
                ['Bagas Pratama', 5, 'Es tehnya besar dan manisnya pas, cocok setelah makan nasi goreng.'],
            ],
        ];

        foreach ($ulasans as $namaMenu => $daftar) {
            $masakan = Masakan::query()
                ->where('nama', 'like', $namaMenu.'%')
                ->first();

            if (! $masakan) {
                continue;
            }

            foreach ($daftar as [$nama, $rating, $komentar]) {
                Review::updateOrCreate(
                    [
                        'masakan_id' => $masakan->id,
                        'nama' => $nama,
                    ],
                    [
                        'rating' => $rating,
                        'komentar' => $komentar,
                        'terverifikasi' => true,
                    ],
                );
            }
        }
    }
}
