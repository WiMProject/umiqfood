<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResepItem extends Model
{
    use HasFactory;

    protected $fillable = ['masakan_id', 'bahan_baku_id', 'jumlah'];

    protected $casts = [
        'jumlah' => 'float',
    ];

    public function masakan(): BelongsTo
    {
        return $this->belongsTo(Masakan::class);
    }

    public function bahanBaku(): BelongsTo
    {
        return $this->belongsTo(BahanBaku::class);
    }
}
