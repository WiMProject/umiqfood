<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int $masakan_id
 * @property int $jumlah
 */
class CartItem extends Model
{
    protected $fillable = [
        'user_id',
        'masakan_id',
        'jumlah',
    ];

    protected $casts = [
        'jumlah' => 'integer',
    ];

    protected $appends = ['subtotal', 'subtotal_format'];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Masakan, $this>
     */
    public function masakan(): BelongsTo
    {
        return $this->belongsTo(Masakan::class);
    }

    public function getSubtotalAttribute(): int
    {
        return $this->masakan->harga * $this->jumlah;
    }

    public function getSubtotalFormatAttribute(): string
    {
        return 'Rp '.number_format($this->subtotal, 0, ',', '.');
    }
}
