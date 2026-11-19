<?php

namespace App\Models;

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
    protected $appends = ['harga_format', 'foto_url'];

    // Relasi: 1 Masakan MILIK 1 Kategori
    /**
     * @return BelongsTo<Kategori, $this>
     */
    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class);
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

    // Accessor: format Rupiah (contoh: Rp 15.000)
    public function getHargaFormatAttribute(): string
    {
        return 'Rp '.number_format($this->harga, 0, ',', '.');
    }

    // Accessor: URL lengkap foto
    public function getFotoUrlAttribute(): ?string
    {
        return $this->foto ? asset('storage/'.$this->foto) : null;
    }
}
