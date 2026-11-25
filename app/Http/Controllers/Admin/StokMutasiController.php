<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StokMovement;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StokMutasiController extends Controller
{
    /**
     * Riwayat seluruh perubahan stok bahan baku dan porsi menu.
     */
    public function index(Request $request): Response
    {
        $request->validate([
            'dari' => ['nullable', 'date'],
            'sampai' => ['nullable', 'date'],
            'jenis' => ['nullable', Rule::in(array_keys(StokMovement::JENIS_LABELS))],
            'sumber' => ['nullable', Rule::in(array_keys(StokMovement::SUMBER_LABELS))],
        ]);

        $query = StokMovement::query()
            ->with([
                'bahanBaku:id,nama,satuan',
                'masakan:id,nama',
                'order:id,kode,tanggal',
                'user:id,name',
            ])
            ->when($request->filled('dari'), fn ($query) => $query
                ->whereDate('created_at', '>=', $request->input('dari')))
            ->when($request->filled('sampai'), fn ($query) => $query
                ->whereDate('created_at', '<=', $request->input('sampai')))
            ->when($request->filled('jenis'), fn ($query) => $query
                ->where('jenis', $request->input('jenis')))
            ->when($request->filled('sumber'), fn ($query) => $query
                ->where('sumber', $request->input('sumber')));

        $semua = (clone $query)->get();

        $movements = (clone $query)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        return Inertia::render('admin/stok-mutasi/index', [
            'movements' => $movements,
            'stats' => [
                'jumlah' => $semua->count(),
                'masuk' => $semua->where('jenis', StokMovement::JENIS_MASUK)->count(),
                'keluar' => $semua->where('jenis', StokMovement::JENIS_KELUAR)->count(),
                'porsi_terjual' => (int) $semua
                    ->where('sumber', StokMovement::SUMBER_PEMBAYARAN)
                    ->where('satuan', 'porsi')
                    ->sum('jumlah'),
            ],
            'filters' => [
                'dari' => $request->input('dari', ''),
                'sampai' => $request->input('sampai', ''),
                'jenis' => $request->input('jenis', ''),
                'sumber' => $request->input('sumber', ''),
            ],
            'jenisList' => collect(StokMovement::JENIS_LABELS)
                ->map(fn (string $label, string $value): array => [
                    'value' => $value,
                    'label' => $label,
                ])
                ->values()
                ->all(),
            'sumberList' => collect(StokMovement::SUMBER_LABELS)
                ->map(fn (string $label, string $value): array => [
                    'value' => $value,
                    'label' => $label,
                ])
                ->values()
                ->all(),
        ]);
    }
}
