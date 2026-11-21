<?php

namespace Database\Seeders;

use App\Models\Masakan;
use App\Models\MasakanFoto;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class MasakanFotoSeeder extends Seeder
{
    /**
     * Tempelkan foto contoh (3 foto per menu) ke katalog.
     * Berkas sumber ada di database/seeders/fixtures/masakan.
     */
    public function run(): void
    {
        /** @var array<string, array<int, string>> $galeri */
        $galeri = [
            'Nasi Goreng Spesial Umiq' => [
                'nasi-goreng-1.jpg',
                'nasi-goreng-2.jpg',
                'nasi-goreng-3.jpg',
            ],
            'Ayam Geprek Sambal Korek' => [
                'ayam-geprek-1.jpg',
                'ayam-geprek-2.jpg',
                'ayam-geprek-3.jpg',
            ],
            'Nasi Ayam Kremes' => [
                'ayam-kremes-1.jpg',
                'ayam-kremes-2.jpg',
                'ayam-kremes-3.jpg',
            ],
            'Nasi Rendang Daging' => [
                'rendang-1.jpg',
                'rendang-2.jpg',
                'rendang-3.jpg',
            ],
            'Mie Goreng Jawa' => [
                'mie-goreng-1.jpg',
                'mie-goreng-2.jpg',
                'mie-goreng-3.jpg',
            ],
            'Es Teh Manis Jumbo' => [
                'es-teh-1.jpg',
                'es-teh-2.jpg',
                'es-teh-3.jpg',
            ],
            'Es Jeruk Segar' => [
                'es-jeruk-1.jpg',
                'es-jeruk-2.jpg',
                'es-jeruk-3.jpg',
            ],
            'Kopi Tubruk Gula Aren' => [
                'kopi-tubruk-1.jpg',
                'kopi-tubruk-2.jpg',
                'kopi-tubruk-3.jpg',
            ],
            'Es Campur Umiq' => [
                'es-campur-1.jpg',
                'es-campur-2.jpg',
                'es-campur-3.jpg',
            ],
            'Tahu Crispy Sambal Kecap' => [
                'tahu-goreng-1.jpg',
                'tahu-goreng-2.jpg',
                'tahu-goreng-3.jpg',
            ],
            'Pisang Goreng Keju' => [
                'pisang-goreng-1.jpg',
                'pisang-goreng-2.jpg',
                'pisang-goreng-3.jpg',
            ],
            'Kentang Goreng' => [
                'kentang-goreng-1.jpg',
                'kentang-goreng-2.jpg',
                'kentang-goreng-3.jpg',
            ],
            'Singkong Goreng Sambal' => [
                'singkong-goreng-1.jpg',
                'singkong-goreng-2.jpg',
                'singkong-goreng-3.jpg',
            ],
        ];

        foreach ($galeri as $nama => $files) {
            $masakan = Masakan::query()->where('nama', $nama)->first();

            if (! $masakan) {
                continue;
            }

            $tersimpan = $masakan->fotos()->get()->keyBy('path');
            $urutan = (int) $tersimpan->max('urutan');

            foreach ($files as $file) {
                $asal = database_path('seeders/fixtures/masakan/'.$file);
                $tujuan = 'masakans/contoh/'.$file;

                if ($tersimpan->has($tujuan)) {
                    continue;
                }

                if (! Storage::disk('public')->exists($tujuan)) {
                    if (! is_file($asal)) {
                        continue;
                    }

                    $isi = file_get_contents($asal);

                    if ($isi === false) {
                        continue;
                    }

                    Storage::disk('public')->put($tujuan, $isi);
                }

                $foto = $masakan->fotos()->create([
                    'path' => $tujuan,
                    'urutan' => ++$urutan,
                ]);

                $tersimpan->put($tujuan, $foto);
            }

            $fotos = $masakan->fotos()->get();

            if ($fotos->isEmpty()) {
                continue;
            }

            // Cover selalu jadi foto pertama, sisanya mengikuti urutan lama.
            $cover = ($masakan->foto
                ? $fotos->firstWhere('path', $masakan->foto)
                : null) ?? $fotos->first();

            $lainnya = $fotos
                ->reject(fn (MasakanFoto $foto) => $foto->id === $cover->id)
                ->sortBy([['urutan', 'asc'], ['id', 'asc']])
                ->values();

            collect([$cover])
                ->concat($lainnya)
                ->values()
                ->each(function (MasakanFoto $foto, int $indeks): void {
                    $urutanBaru = $indeks + 1;

                    if ($foto->urutan !== $urutanBaru) {
                        $foto->update(['urutan' => $urutanBaru]);
                    }
                });

            if ($masakan->foto !== $cover->path) {
                $masakan->update(['foto' => $cover->path]);
            }
        }
    }
}
