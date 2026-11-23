<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $kode
 * @property string|null $nama
 * @property string $tipe
 * @property int $nilai
 * @property int $min_subtotal
 * @property int|null $maks_diskon
 * @property int|null $kuota
 * @property int $maks_per_user
 * @property Carbon|null $mulai
 * @property Carbon|null $selesai
 * @property bool $aktif
 */
class Kupon extends Model
{
    public const TIPE_PERSEN = 'persen';

    public const TIPE_NOMINAL = 'nominal';

    public const TIPE_LABELS = [
        self::TIPE_PERSEN => 'Persen',
        self::TIPE_NOMINAL => 'Nominal',
    ];

    protected $fillable = [
        'kode',
        'nama',
        'tipe',
        'nilai',
        'min_subtotal',
        'maks_diskon',
        'kuota',
        'maks_per_user',
        'mulai',
        'selesai',
        'aktif',
    ];

    protected $casts = [
        'nilai' => 'integer',
        'min_subtotal' => 'integer',
        'maks_diskon' => 'integer',
        'kuota' => 'integer',
        'maks_per_user' => 'integer',
        'mulai' => 'date',
        'selesai' => 'date',
        'aktif' => 'boolean',
    ];

    protected $appends = ['tipe_label', 'nilai_format'];

    /**
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Kupon yang aktif dan berada dalam periode berlaku.
     *
     * @param  Builder<Kupon>  $query
     */
    public function scopeBerlaku(Builder $query): void
    {
        $hariIni = Carbon::today()->toDateString();

        $query->where('aktif', true)
            ->where(fn (Builder $sub) => $sub
                ->whereNull('mulai')
                ->orWhereDate('mulai', '<=', $hariIni))
            ->where(fn (Builder $sub) => $sub
                ->whereNull('selesai')
                ->orWhereDate('selesai', '>=', $hariIni));
    }

    public function sedangBerlaku(): bool
    {
        $hariIni = Carbon::today();

        if (! $this->aktif) {
            return false;
        }

        if ($this->mulai && $hariIni->lt($this->mulai->copy()->startOfDay())) {
            return false;
        }

        if ($this->selesai && $hariIni->gt($this->selesai->copy()->endOfDay())) {
            return false;
        }

        return true;
    }

    public function hitungDiskon(int $subtotal): int
    {
        if ($subtotal <= 0) {
            return 0;
        }

        $diskon = match ($this->tipe) {
            self::TIPE_PERSEN => (int) floor($subtotal * $this->nilai / 100),
            self::TIPE_NOMINAL => $this->nilai,
            default => 0,
        };

        if ($this->maks_diskon !== null) {
            $diskon = min($diskon, $this->maks_diskon);
        }

        return max(0, min($diskon, $subtotal));
    }

    public function jumlahPemakaian(): int
    {
        return $this->orders()
            ->where('status', '!=', Order::STATUS_DIBATALKAN)
            ->count();
    }

    public function jumlahPemakaianUser(User $user): int
    {
        return $this->orders()
            ->where('user_id', $user->id)
            ->where('status', '!=', Order::STATUS_DIBATALKAN)
            ->count();
    }

    public function getTipeLabelAttribute(): string
    {
        return self::TIPE_LABELS[$this->tipe] ?? ucfirst($this->tipe);
    }

    public function getNilaiFormatAttribute(): string
    {
        if ($this->tipe === self::TIPE_PERSEN) {
            return $this->nilai.'%';
        }

        return 'Rp '.number_format($this->nilai, 0, ',', '.');
    }
}
