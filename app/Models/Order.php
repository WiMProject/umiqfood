<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $kode
 * @property Carbon $tanggal
 * @property int $nomor_antrian
 * @property string $status
 * @property string $metode_pembayaran
 * @property int $subtotal
 * @property int $total
 * @property string $nama_pengambil
 * @property string $no_hp
 * @property string|null $catatan
 * @property Carbon|null $estimasi_siap_at
 * @property Carbon|null $siap_at
 * @property Carbon|null $diambil_at
 * @property Carbon|null $dibatalkan_at
 */
class Order extends Model
{
    public const STATUS_MENUNGGU = 'menunggu';

    public const STATUS_DIMASAK = 'dimasak';

    public const STATUS_SIAP = 'siap';

    public const STATUS_SELESAI = 'selesai';

    public const STATUS_DIBATALKAN = 'dibatalkan';

    public const STATUS_LABELS = [
        self::STATUS_MENUNGGU => 'Menunggu konfirmasi',
        self::STATUS_DIMASAK => 'Sedang dimasak',
        self::STATUS_SIAP => 'Siap diambil',
        self::STATUS_SELESAI => 'Selesai',
        self::STATUS_DIBATALKAN => 'Dibatalkan',
    ];

    public const METODE_CASH = 'cash';

    public const METODE_QRIS = 'qris';

    public const METODE_LABELS = [
        self::METODE_CASH => 'Bayar di tempat',
        self::METODE_QRIS => 'QRIS di kasir',
    ];

    protected $fillable = [
        'user_id',
        'kode',
        'tanggal',
        'nomor_antrian',
        'status',
        'metode_pembayaran',
        'subtotal',
        'total',
        'nama_pengambil',
        'no_hp',
        'catatan',
        'estimasi_siap_at',
        'siap_at',
        'diambil_at',
        'dibatalkan_at',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'nomor_antrian' => 'integer',
        'subtotal' => 'integer',
        'total' => 'integer',
        'estimasi_siap_at' => 'datetime',
        'siap_at' => 'datetime',
        'diambil_at' => 'datetime',
        'dibatalkan_at' => 'datetime',
    ];

    protected $appends = [
        'antrian_format',
        'status_label',
        'metode_pembayaran_label',
        'total_format',
        'tanggal_format',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return HasOne<Payment, $this>
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function isActive(): bool
    {
        return in_array($this->status, [
            self::STATUS_MENUNGGU,
            self::STATUS_DIMASAK,
            self::STATUS_SIAP,
        ], true);
    }

    public function getAntrianFormatAttribute(): string
    {
        return 'A-'.str_pad((string) $this->nomor_antrian, 3, '0', STR_PAD_LEFT);
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUS_LABELS[$this->status] ?? ucfirst($this->status);
    }

    public function getMetodePembayaranLabelAttribute(): string
    {
        return self::METODE_LABELS[$this->metode_pembayaran] ?? ucfirst($this->metode_pembayaran);
    }

    public function getTotalFormatAttribute(): string
    {
        return 'Rp '.number_format($this->total, 0, ',', '.');
    }

    public function getTanggalFormatAttribute(): string
    {
        return $this->tanggal->format('d/m/Y');
    }
}
