<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $masakan_id
 * @property int|null $user_id
 * @property string $nama
 * @property int $rating
 * @property string|null $komentar
 * @property bool $terverifikasi
 */
class Review extends Model
{
    protected $fillable = [
        'masakan_id',
        'user_id',
        'nama',
        'rating',
        'komentar',
        'terverifikasi',
    ];

    protected $casts = [
        'rating' => 'integer',
        'terverifikasi' => 'boolean',
    ];

    protected $appends = ['rating_bintang'];

    /**
     * @return BelongsTo<Masakan, $this>
     */
    public function masakan(): BelongsTo
    {
        return $this->belongsTo(Masakan::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Rating dalam bentuk bintang untuk ditampilkan di UI.
     */
    public function getRatingBintangAttribute(): string
    {
        return str_repeat('★', $this->rating).str_repeat('☆', max(0, 5 - $this->rating));
    }
}
