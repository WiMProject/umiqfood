<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Masakan extends Model
{
    use HasFactory;
    protected $fillable = [
        'nama',
        'deskripsi',
        'harga',
        'foto',
        'tersedia',
        'kategori_id',
    ];
    protected $casts = [
        'harga' => 'integer',
        'tersedia' => 'boolean',
    ];
    // Otomatis bawa atribut ini ke frontend JSON
    protected $appends = ['harga_format', 'foto_url'];
    // Relasi: 1 Masakan MILIK 1 Kategori
    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class);
    }
    // Accessor: format Rupiah (contoh: Rp 15.000)
    public function getHargaFormatAttribute(): string
    {
        return 'Rp ' . number_format($this->harga, 0, ',', '.');
    }
    // Accessor: URL lengkap foto
    public function getFotoUrlAttribute(): ?string
    {
        return $this->foto ? asset('storage/' . $this->foto) : null;
    }
}
