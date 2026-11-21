<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property Carbon $tanggal
 * @property string $kategori
 * @property int $jumlah
 */
class Pengeluaran extends Model
{
    public const KATEGORI_BAHAN_BAKU = 'bahan_baku';

    public const KATEGORI_OPERASIONAL = 'operasional';

    public const KATEGORI_GAJI = 'gaji';

    public const KATEGORI_LISTRIK = 'listrik';

    public const KATEGORI_LAINNYA = 'lainnya';

    public const KATEGORI_LABELS = [
        self::KATEGORI_BAHAN_BAKU => 'Beli bahan baku',
        self::KATEGORI_OPERASIONAL => 'Operasional',
        self::KATEGORI_GAJI => 'Gaji',
        self::KATEGORI_LISTRIK => 'Listrik & gas',
        self::KATEGORI_LAINNYA => 'Lainnya',
    ];

    protected $fillable = [
        'tanggal',
        'kategori',
        'deskripsi',
        'jumlah',
        'bahan_baku_id',
        'qty',
        'harga_satuan',
        'user_id',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jumlah' => 'integer',
        'qty' => 'float',
        'harga_satuan' => 'float',
    ];

    protected $appends = ['jumlah_format'];

    /**
     * @return BelongsTo<BahanBaku, $this>
     */
    public function bahanBaku(): BelongsTo
    {
        return $this->belongsTo(BahanBaku::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getJumlahFormatAttribute(): string
    {
        return 'Rp '.number_format($this->jumlah, 0, ',', '.');
    }
}
