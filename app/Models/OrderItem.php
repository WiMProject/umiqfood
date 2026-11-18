<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $order_id
 * @property int|null $masakan_id
 * @property string $nama_menu
 * @property int $harga
 * @property int $jumlah
 * @property int $subtotal
 */
class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'masakan_id',
        'nama_menu',
        'harga',
        'jumlah',
        'subtotal',
    ];

    protected $casts = [
        'harga' => 'integer',
        'jumlah' => 'integer',
        'subtotal' => 'integer',
    ];

    protected $appends = ['harga_format', 'subtotal_format'];

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return BelongsTo<Masakan, $this>
     */
    public function masakan(): BelongsTo
    {
        return $this->belongsTo(Masakan::class);
    }

    public function getHargaFormatAttribute(): string
    {
        return 'Rp '.number_format($this->harga, 0, ',', '.');
    }

    public function getSubtotalFormatAttribute(): string
    {
        return 'Rp '.number_format($this->subtotal, 0, ',', '.');
    }
}
