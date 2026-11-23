<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Masakan extends Model
{
    protected $fillable = [
        'nama',
        'deskripsi',
        'harga',
        'foto',
        'tersedia',
        'jumlah_porsi',
        'kategori_id',
    ];

    protected $casts = [
        'harga' => 'integer',
        'tersedia' => 'boolean',
        'jumlah_porsi' => 'integer',
    ];

    // Otomatis bawa atribut ini ke frontend JSON
    protected $appends = ['harga_format', 'foto_url', 'porsi_dipesan', 'porsi_tersedia'];

    // Hasil withSum dipakai accessor, tidak perlu ikut ke JSON.
    protected $hidden = ['porsi_dipesan_mentah'];

    // Relasi: 1 Masakan MILIK 1 Kategori
    /**
     * @return BelongsTo<Kategori, $this>
     */
    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class);
    }

    // Relasi: 1 Masakan punya BANYAK foto (galeri)
    /**
     * @return HasMany<MasakanFoto, $this>
     */
    public function fotos(): HasMany
    {
        return $this->hasMany(MasakanFoto::class)
            ->orderBy('urutan')
            ->orderBy('id');
    }

    /**
     * Item pesanan yang masih aktif dan porsinya belum dipotong.
     * Dipakai untuk menghitung porsi yang sedang direservasi pembeli.
     *
     * @return HasMany<OrderItem, $this>
     */
    public function porsiReservasi(): HasMany
    {
        return $this->hasMany(OrderItem::class)
            ->whereNotNull('masakan_id')
            ->whereHas('order', fn ($query) => $query
                ->whereIn('status', [
                    Order::STATUS_MENUNGGU,
                    Order::STATUS_DIMASAK,
                    Order::STATUS_SIAP,
                ])
                ->where('porsi_dipotong', false));
    }

    /**
     * Eager load jumlah porsi yang sedang dipesan agar tidak N+1.
     *
     * @param  Builder<Masakan>  $query
     * @return Builder<Masakan>
     */
    public function scopeWithPorsiTersedia(Builder $query): Builder
    {
        return $query->withSum('porsiReservasi as porsi_dipesan_mentah', 'jumlah');
    }

    // Relasi: 1 Masakan punya BANYAK item resep
    /**
     * @return HasMany<ResepItem, $this>
     */
    public function resepItems(): HasMany
    {
        return $this->hasMany(ResepItem::class);
    }

    // Relasi: ulasan/komentar pelanggan (tanpa resep atau bahan baku)
    /**
     * @return HasMany<Review, $this>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    // Relasi: bahan baku yang dipakai (dengan takaran per porsi di pivot)
    /**
     * @return BelongsToMany<BahanBaku, $this>
     */
    public function bahanBakus(): BelongsToMany
    {
        return $this->belongsToMany(BahanBaku::class, 'resep_items')
            ->withPivot('jumlah')
            ->withTimestamps();
    }

    // Estimasi maksimal porsi yang bisa dimasak dari stok bahan saat ini.
    // Null = tidak ada resep (tidak dibatasi bahan).
    public function getMaxPorsiAttribute(): ?int
    {
        $items = $this->resepItems;
        if ($items->isEmpty()) {
            return null;
        }

        return (int) $items
            ->map(function (ResepItem $item) {
                if ($item->jumlah <= 0) {
                    return 0;
                }

                return (int) floor($item->bahanBaku->stok / $item->jumlah);
            })
            ->min();
    }

    // Jumlah porsi yang sedang dipegang pesanan aktif belum lunas.
    public function getPorsiDipesanAttribute(): int
    {
        if ($this->relationLoaded('porsiReservasi')) {
            return (int) $this->porsiReservasi->sum('jumlah');
        }

        return (int) ($this->attributes['porsi_dipesan_mentah'] ?? 0);
    }

    // Angka yang dilihat pembeli: stok fisik dikurangi reservasi aktif.
    public function getPorsiTersediaAttribute(): int
    {
        return max(0, (int) $this->jumlah_porsi - $this->porsi_dipesan);
    }

    // Accessor: format Rupiah (contoh: Rp 15.000)
    public function getHargaFormatAttribute(): string
    {
        return 'Rp '.number_format($this->harga, 0, ',', '.');
    }

    // Accessor: URL lengkap foto utama (fallback ke foto galeri pertama)
    public function getFotoUrlAttribute(): ?string
    {
        if ($this->foto) {
            return asset('storage/'.$this->foto);
        }

        $foto = $this->relationLoaded('fotos')
            ? $this->fotos->first()
            : $this->fotos()->first();

        return $foto?->url;
    }
}
