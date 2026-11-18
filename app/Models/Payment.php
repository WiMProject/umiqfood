<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $order_id
 * @property string $kode
 * @property string $metode
 * @property int $jumlah
 * @property string $status
 * @property Carbon|null $dibayar_at
 */
class Payment extends Model
{
    public const STATUS_MENUNGGU = 'menunggu';

    public const STATUS_BERHASIL = 'berhasil';

    public const STATUS_GAGAL = 'gagal';

    public const STATUS_LABELS = [
        self::STATUS_MENUNGGU => 'Belum dibayar',
        self::STATUS_BERHASIL => 'Lunas',
        self::STATUS_GAGAL => 'Gagal / batal',
    ];

    public const METODE_LABELS = [
        Order::METODE_CASH => 'Bayar di tempat',
        Order::METODE_QRIS => 'QRIS di kasir',
    ];

    protected $fillable = [
        'order_id',
        'kode',
        'metode',
        'jumlah',
        'status',
        'dibayar_at',
    ];

    protected $casts = [
        'jumlah' => 'integer',
        'dibayar_at' => 'datetime',
    ];

    protected $appends = ['status_label', 'metode_label', 'jumlah_format'];

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function isBerhasil(): bool
    {
        return $this->status === self::STATUS_BERHASIL;
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status] ?? ucfirst($this->status);
    }

    public function getMetodeLabelAttribute(): string
    {
        return self::METODE_LABELS[$this->metode] ?? ucfirst($this->metode);
    }

    public function getJumlahFormatAttribute(): string
    {
        return 'Rp '.number_format($this->jumlah, 0, ',', '.');
    }
}
