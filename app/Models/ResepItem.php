<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResepItem extends Model
{
    protected $fillable = ['masakan_id', 'bahan_baku_id', 'jumlah'];

    protected $casts = [
        'jumlah' => 'float',
    ];

    /**
     * @return BelongsTo<Masakan, $this>
     */
    public function masakan(): BelongsTo
    {
        return $this->belongsTo(Masakan::class);
    }

    /**
     * @return BelongsTo<BahanBaku, $this>
     */
    public function bahanBaku(): BelongsTo
    {
        return $this->belongsTo(BahanBaku::class);
    }
}
