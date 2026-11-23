<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    protected $fillable = [
        'pertanyaan',
        'jawaban',
        'urutan',
        'aktif',
    ];

    protected $casts = [
        'urutan' => 'integer',
        'aktif' => 'boolean',
    ];

    /**
     * @param  Builder<Faq>  $query
     */
    public function scopeAktif(Builder $query): void
    {
        $query->where('aktif', true)
            ->orderBy('urutan')
            ->orderBy('id');
    }
}
