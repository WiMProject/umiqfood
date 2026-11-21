<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StokMovement extends Model
{
    public const JENIS_MASUK = 'masuk';

    public const JENIS_KELUAR = 'keluar';

    public const SUMBER_PEMBELIAN = 'pembelian';

    public const SUMBER_PENYESUAIAN = 'penyesuaian';

    public const SUMBER_MASAK = 'masak';

    public const SUMBER_PEMBAYARAN = 'pembayaran';

    public const SUMBER_PEMBATAAN = 'pembatalan';

    public const JENIS_LABELS = [
        self::JENIS_MASUK => 'Stok masuk',
        self::JENIS_KELUAR => 'Stok keluar',
    ];

    public const SUMBER_LABELS = [
        self::SUMBER_PEMBELIAN => 'Pembelian bahan',
        self::SUMBER_PENYESUAIAN => 'Penyesuaian manual',
        self::SUMBER_MASAK => 'Masak menu',
        self::SUMBER_PEMBAYARAN => 'Pembayaran lunas',
        self::SUMBER_PEMBATAAN => 'Pembatalan pesanan',
    ];

    protected $fillable = [
        'jenis',
        'sumber',
        'bahan_baku_id',
        'masakan_id',
        'order_id',
        'jumlah',
        'satuan',
        'harga_satuan',
        'keterangan',
        'user_id',
    ];

    protected $casts = [
        'jumlah' => 'float',
        'harga_satuan' => 'float',
    ];

    protected $appends = ['tanda', 'jenis_label', 'sumber_label'];

    /**
     * @return BelongsTo<BahanBaku, $this>
     */
    public function bahanBaku(): BelongsTo
    {
        return $this->belongsTo(BahanBaku::class);
    }

    /**
     * @return BelongsTo<Masakan, $this>
     */
    public function masakan(): BelongsTo
    {
        return $this->belongsTo(Masakan::class);
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getTandaAttribute(): string
    {
        return $this->jenis === self::JENIS_MASUK ? '+' : '−';
    }

    public function getJenisLabelAttribute(): string
    {
        return self::JENIS_LABELS[$this->jenis] ?? (string) $this->jenis;
    }

    public function getSumberLabelAttribute(): string
    {
        return self::SUMBER_LABELS[$this->sumber] ?? (string) $this->sumber;
    }

    /**
     * Catat satu pergerakan stok. Petugas diambil dari sesi aktif bila tidak
     * diberikan secara eksplisit.
     *
     * @param  array{jenis: string, sumber: string, jumlah: float|int, satuan?: string|null, bahan_baku_id?: int|null, masakan_id?: int|null, order_id?: int|null, harga_satuan?: float|int|null, keterangan?: string|null, user_id?: int|null}  $data
     */
    public static function catat(array $data): self
    {
        return self::create([
            'jenis' => $data['jenis'],
            'sumber' => $data['sumber'],
            'jumlah' => $data['jumlah'],
            'bahan_baku_id' => $data['bahan_baku_id'] ?? null,
            'masakan_id' => $data['masakan_id'] ?? null,
            'order_id' => $data['order_id'] ?? null,
            'satuan' => $data['satuan'] ?? null,
            'harga_satuan' => $data['harga_satuan'] ?? null,
            'keterangan' => $data['keterangan'] ?? null,
            'user_id' => $data['user_id'] ?? auth()->id(),
        ]);
    }
}
