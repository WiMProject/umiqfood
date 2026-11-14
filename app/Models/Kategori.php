<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kategori extends Model
{
    use HasFactory;
    protected $fillable = ['nama', 'icon', 'slug'];
    // Relasi: 1 Kategori punya BANYAK Masakan
    public function masakans(): HasMany
    {
        return $this->hasMany(Masakan::class);
    }
}
