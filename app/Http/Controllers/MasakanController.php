<?php

namespace App\Http\Controllers;

use App\Models\BahanBaku;
use App\Models\Kategori;
use App\Models\Masakan;
use App\Models\StokMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MasakanController extends Controller
{
    /**
     * Tampilkan daftar semua masakan
     */
    public function index(): Response
    {
        $masakans = Masakan::with(['kategori', 'fotos', 'resepItems.bahanBaku'])
            ->withPorsiTersedia()
            ->latest()
            ->get()
            ->each->append('max_porsi');

        $kategoris = Kategori::all();
        $bahanBakus = BahanBaku::orderBy('nama')->get();

        return Inertia::render('admin/masakan/index', [
            'masakans' => $masakans,
            'kategoris' => $kategoris,
            'bahanBakus' => $bahanBakus,
        ]);
    }

    /**
     * Simpan masakan baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'kategori_id' => 'required|exists:kategoris,id',
            'tersedia' => 'boolean',
            'jumlah_porsi' => 'nullable|integer|min:0',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'fotos' => 'nullable|array|max:8',
            'fotos.*' => 'image|mimes:jpg,jpeg,png,webp|max:2048',
            'resep' => 'nullable|array',
            'resep.*.bahan_baku_id' => 'required|exists:bahan_bakus,id',
            'resep.*.jumlah' => 'required|numeric|min:0.01',
        ]);

        $fileBaru = $this->fileFotos($request);
        $jumlahBaru = count($fileBaru) + ($request->hasFile('foto') ? 1 : 0);

        if ($jumlahBaru > 8) {
            throw ValidationException::withMessages([
                'fotos' => 'Maksimal 8 foto untuk setiap menu.',
            ]);
        }

        $data = $validated;
        unset($data['resep'], $data['fotos']);

        if ($request->hasFile('foto')) {
            $data['foto'] = $request->file('foto')->store('masakans', 'public');
        }

        $data['jumlah_porsi'] = $validated['jumlah_porsi'] ?? 0;

        $masakan = Masakan::create($data);

        if (! empty($data['foto'])) {
            $masakan->fotos()->create([
                'path' => $data['foto'],
                'urutan' => 1,
            ]);
        }

        $this->simpanFotos($masakan, $fileBaru);
        $this->sinkronCover($masakan);

        $this->syncResep($masakan, (array) $request->input('resep', []));

        return $this->toast('success', 'Menu masakan berhasil ditambahkan!');
    }

    /**
     * Update masakan yang ada
     */
    public function update(Request $request, Masakan $masakan): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'kategori_id' => 'required|exists:kategoris,id',
            'tersedia' => 'boolean',
            'jumlah_porsi' => 'nullable|integer|min:0',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'fotos' => 'nullable|array',
            'fotos.*' => 'image|mimes:jpg,jpeg,png,webp|max:2048',
            'hapus_foto' => 'nullable|array',
            'hapus_foto.*' => [
                'integer',
                Rule::exists('masakan_fotos', 'id')->where(
                    fn ($query) => $query->where('masakan_id', $masakan->id)
                ),
            ],
            'cover_foto_id' => [
                'nullable',
                'integer',
                Rule::exists('masakan_fotos', 'id')->where(
                    fn ($query) => $query->where('masakan_id', $masakan->id)
                ),
            ],
            'resep' => 'nullable|array',
            'resep.*.bahan_baku_id' => 'required|exists:bahan_bakus,id',
            'resep.*.jumlah' => 'required|numeric|min:0.01',
        ]);

        $hapusFoto = array_map('intval', (array) ($validated['hapus_foto'] ?? []));
        $fileBaru = $this->fileFotos($request);
        $jumlahBaru = count($fileBaru) + ($request->hasFile('foto') ? 1 : 0);
        $jumlahTersimpan = $masakan->fotos()->whereNotIn('id', $hapusFoto)->count();

        if ($jumlahTersimpan + $jumlahBaru > 8) {
            throw ValidationException::withMessages([
                'fotos' => 'Maksimal 8 foto untuk setiap menu.',
            ]);
        }

        $data = $validated;
        unset(
            $data['resep'],
            $data['fotos'],
            $data['hapus_foto'],
            $data['cover_foto_id'],
        );

        if ($request->hasFile('foto')) {
            $data['foto'] = $request->file('foto')->store('masakans', 'public');
            $masakan->fotos()->create([
                'path' => $data['foto'],
                'urutan' => ((int) $masakan->fotos()->max('urutan')) + 1,
            ]);
        }

        $data['jumlah_porsi'] = $validated['jumlah_porsi'] ?? $masakan->jumlah_porsi;

        $masakan->update($data);

        $this->hapusFotos($masakan, $hapusFoto);
        $this->simpanFotos($masakan, $fileBaru);

        if (! empty($validated['cover_foto_id'])) {
            $cover = $masakan->fotos()
                ->whereKey($validated['cover_foto_id'])
                ->first();

            if ($cover) {
                $masakan->update(['foto' => $cover->path]);
            }
        }

        $this->sinkronCover($masakan);

        $this->syncResep($masakan, (array) $request->input('resep', []));

        return $this->toast('success', 'Menu masakan berhasil diperbarui!');
    }

    /**
     * Hapus masakan
     */
    public function destroy(Masakan $masakan): RedirectResponse
    {
        $paths = $masakan->fotos()->pluck('path');

        if ($masakan->foto) {
            $paths->push($masakan->foto);
        }

        foreach ($paths->unique() as $path) {
            Storage::disk('public')->delete($path);
        }

        $masakan->delete();

        return $this->toast('success', 'Menu masakan berhasil dihapus!');
    }

    /**
     * Masak menu: kurangi stok bahan baku sesuai resep & takaran per porsi,
     * lalu tambahkan jumlah porsi siap jual.
     */
    public function masak(Request $request, Masakan $masakan): RedirectResponse
    {
        $validated = $request->validate([
            'jumlah' => 'required|integer|min:1|max:1000',
        ]);

        $porsi = (int) $validated['jumlah'];
        $masakan->load('resepItems');

        try {
            DB::transaction(function () use ($masakan, $porsi): void {
                $resepItems = $masakan->resepItems;

                if ($resepItems->isEmpty()) {
                    throw ValidationException::withMessages([
                        'resep' => 'Menu ini belum punya resep. Tambahkan bahan baku di form edit menu dulu.',
                    ]);
                }

                $bahans = BahanBaku::query()
                    ->whereIn('id', $resepItems->pluck('bahan_baku_id')->unique()->all())
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                $kurang = [];
                foreach ($resepItems as $item) {
                    $bahan = $bahans->get($item->bahan_baku_id);
                    $butuh = (float) $item->jumlah * $porsi;

                    if (! $bahan) {
                        $kurang[] = 'Bahan resep sudah dihapus';

                        continue;
                    }

                    if ((float) $bahan->stok < $butuh) {
                        $kurang[] = sprintf(
                            '%s (butuh %s %s, sisa %s %s)',
                            $bahan->nama,
                            rtrim(rtrim(number_format($butuh, 2, ',', '.'), '0'), ','),
                            $bahan->satuan,
                            rtrim(rtrim(number_format((float) $bahan->stok, 2, ',', '.'), '0'), ','),
                            $bahan->satuan
                        );
                    }
                }

                if ($kurang !== []) {
                    throw ValidationException::withMessages([
                        'stok' => 'Stok bahan tidak cukup: '.implode('; ', $kurang),
                    ]);
                }

                foreach ($resepItems as $item) {
                    $bahan = $bahans->get($item->bahan_baku_id);
                    $jumlah = (float) $item->jumlah * $porsi;

                    $bahan->decrement('stok', $jumlah);

                    StokMovement::catat([
                        'jenis' => StokMovement::JENIS_KELUAR,
                        'sumber' => StokMovement::SUMBER_MASAK,
                        'jumlah' => $jumlah,
                        'satuan' => $bahan->satuan,
                        'bahan_baku_id' => $bahan->id,
                        'harga_satuan' => $bahan->harga_beli,
                        'keterangan' => "Masak {$porsi} porsi {$masakan->nama} - {$bahan->nama}",
                    ]);
                }

                $masakan->increment('jumlah_porsi', $porsi);
                $masakan->update(['tersedia' => true]);

                StokMovement::catat([
                    'jenis' => StokMovement::JENIS_MASUK,
                    'sumber' => StokMovement::SUMBER_MASAK,
                    'jumlah' => $porsi,
                    'satuan' => 'porsi',
                    'masakan_id' => $masakan->id,
                    'keterangan' => "Masak {$porsi} porsi {$masakan->nama}",
                ]);
            });
        } catch (ValidationException $exception) {
            $errors = $exception->errors();

            return $this->toast('error', $errors['stok'][0] ?? $errors['resep'][0] ?? 'Stok bahan tidak cukup.');
        }

        return $this->toast(
            'success',
            "Berhasil memasak {$porsi} porsi {$masakan->nama}. Stok bahan baku sudah dikurangi."
        );
    }

    /**
     * Kirim notifikasi toast lewat Inertia lalu kembali ke halaman sebelumnya.
     */
    private function toast(string $type, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);

        return back();
    }

    /**
     * Ambil berkas galeri yang diunggah dari request.
     *
     * @return array<int, UploadedFile>
     */
    private function fileFotos(Request $request): array
    {
        $files = $request->file('fotos', []);

        if (! is_array($files)) {
            return [];
        }

        return array_values($files);
    }

    /**
     * Simpan berkas galeri baru ke storage dan database.
     *
     * @param  array<int, UploadedFile>  $files
     */
    private function simpanFotos(Masakan $masakan, array $files): void
    {
        if ($files === []) {
            return;
        }

        $urutan = (int) $masakan->fotos()->max('urutan');

        foreach ($files as $file) {
            $masakan->fotos()->create([
                'path' => $file->store('masakans', 'public'),
                'urutan' => ++$urutan,
            ]);
        }
    }

    /**
     * Hapus foto galeri terpilih beserta berkasnya.
     *
     * @param  array<int, int>  $ids
     */
    private function hapusFotos(Masakan $masakan, array $ids): void
    {
        if ($ids === []) {
            return;
        }

        $fotos = $masakan->fotos()->whereIn('id', $ids)->get();

        foreach ($fotos as $foto) {
            Storage::disk('public')->delete($foto->path);
        }

        $masakan->fotos()->whereIn('id', $ids)->delete();
    }

    /**
     * Pastikan foto utama selalu menunjuk ke foto galeri yang masih ada.
     */
    private function sinkronCover(Masakan $masakan): void
    {
        $paths = $masakan->fotos()->pluck('path');

        if ($masakan->foto && $paths->contains($masakan->foto)) {
            return;
        }

        $masakan->update(['foto' => $paths->first()]);
    }

    /**
     * Sinkronkan resep (bahan baku + takaran per porsi) milik masakan.
     *
     * @param  array<int, array{bahan_baku_id?: int|string|null, jumlah?: int|string|null}>  $resep
     */
    private function syncResep(Masakan $masakan, array $resep): void
    {
        $items = collect($resep)
            ->filter(fn ($row) => ! empty($row['bahan_baku_id']) && isset($row['jumlah']) && $row['jumlah'] !== '')
            ->map(fn ($row) => [
                'bahan_baku_id' => (int) $row['bahan_baku_id'],
                'jumlah' => $row['jumlah'],
            ])
            ->unique('bahan_baku_id')
            ->values();

        $masakan->resepItems()->delete();

        if ($items->isNotEmpty()) {
            $masakan->resepItems()->createMany($items->all());
        }
    }
}
