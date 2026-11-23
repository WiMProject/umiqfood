<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $judul
 * @property string $slug
 * @property string $jenis
 * @property string|null $ringkasan
 * @property string|null $isi
 * @property string|null $gambar
 * @property int|null $kupon_id
 * @property Carbon|null $mulai
 * @property Carbon|null $selesai
 * @property bool $aktif
 * @property int $urutan
 */
class Pengumuman extends Model
{
    public const JENIS_PROMO = 'promo';

    public const JENIS_INFO = 'info';

    public const JENIS_LABELS = [
        self::JENIS_PROMO => 'Promo',
        self::JENIS_INFO => 'Info',
    ];

    protected $table = 'pengumumans';

    protected $fillable = [
        'judul',
        'slug',
        'jenis',
        'ringkasan',
        'isi',
        'gambar',
        'kupon_id',
        'mulai',
        'selesai',
        'aktif',
        'urutan',
    ];

    protected $casts = [
        'mulai' => 'date',
        'selesai' => 'date',
        'aktif' => 'boolean',
        'urutan' => 'integer',
    ];

    protected $appends = ['jenis_label', 'gambar_url', 'kode_kupon_aktif'];

    /**
     * @return BelongsTo<Kupon, $this>
     */
    public function kupon(): BelongsTo
    {
        return $this->belongsTo(Kupon::class);
    }

    /**
     * Pengumuman yang aktif dan masih dalam periode tayang.
     *
     * @param  Builder<Pengumuman>  $query
     */
    public function scopeTampil(Builder $query): void
    {
        $hariIni = Carbon::today()->toDateString();

        $query->where('aktif', true)
            ->where(fn (Builder $sub) => $sub
                ->whereNull('mulai')
                ->orWhereDate('mulai', '<=', $hariIni))
            ->where(fn (Builder $sub) => $sub
                ->whereNull('selesai')
                ->orWhereDate('selesai', '>=', $hariIni))
            ->orderBy('urutan')
            ->orderByDesc('id');
    }

    public function getJenisLabelAttribute(): string
    {
        return self::JENIS_LABELS[$this->jenis] ?? ucfirst($this->jenis);
    }

    public function getKodeKuponAktifAttribute(): ?string
    {
        if (! $this->kupon || ! $this->kupon->aktif) {
            return null;
        }

        return $this->kupon->kode;
    }

    public function getGambarUrlAttribute(): ?string
    {
        if (! $this->gambar) {
            return null;
        }

        return Storage::disk('public')->url($this->gambar);
    }
}
