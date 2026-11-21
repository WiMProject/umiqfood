<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MasakanFoto extends Model
{
    protected $fillable = [
        'masakan_id',
        'path',
        'urutan',
    ];

    protected $casts = [
        'urutan' => 'integer',
    ];

    protected $appends = ['url'];

    /**
     * @return BelongsTo<Masakan, $this>
     */
    public function masakan(): BelongsTo
    {
        return $this->belongsTo(Masakan::class);
    }

    public function getUrlAttribute(): string
    {
        return asset('storage/'.$this->path);
    }
}
