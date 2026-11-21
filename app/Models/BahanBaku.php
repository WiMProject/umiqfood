<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BahanBaku extends Model
{
    protected $fillable = ['nama', 'satuan', 'stok', 'stok_minimum', 'harga_beli'];

    protected $casts = [
        'stok' => 'float',
        'stok_minimum' => 'float',
        'harga_beli' => 'float',
    ];

    protected $appends = ['stok_menipis'];

    // Relasi: 1 bahan baku dipakai di BANYAK resep
    /**
     * @return HasMany<ResepItem, $this>
     */
    public function resepItems(): HasMany
    {
        return $this->hasMany(ResepItem::class);
    }

    // Helper: stok menipis?
    public function getStokMenipisAttribute(): bool
    {
        return $this->stok <= $this->stok_minimum;
    }
}
