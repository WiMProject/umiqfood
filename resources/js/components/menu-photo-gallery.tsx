import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from 'cn';
import type { MasakanFoto } from '@/types';

interface Props {
    nama: string;
    fotoUrl?: string | null;
    fotos?: MasakanFoto[];
    icon?: string | null;
    className?: string;
    children?: React.ReactNode;
}

export function MenuPhotoGallery({
    nama,
    fotoUrl,
    fotos,
    icon,
    className,
    children,
}: Props) {
    const daftar = useMemo(() => {
        if (fotos && fotos.length > 0) {
            // Mulai galeri dari foto cover agar seragam dengan kartu menu.
            const indeksCover = fotoUrl
                ? fotos.findIndex((foto) => foto.url === fotoUrl)
                : -1;
            const urut =
                indeksCover > 0
                    ? [
                          ...fotos.slice(indeksCover),
                          ...fotos.slice(0, indeksCover),
                      ]
                    : fotos;

            return urut.map((foto) => ({ id: foto.id, url: foto.url }));
        }

        return fotoUrl ? [{ id: 0, url: fotoUrl }] : [];
    }, [fotoUrl, fotos]);

    const [aktif, setAktif] = useState(0);
    const jumlah = daftar.length;
    const indeksAman = jumlah > 0 ? Math.min(aktif, jumlah - 1) : 0;
    const fotoAktif = daftar[indeksAman];

    useEffect(() => {
        setAktif(0);
    }, [nama]);

    const geser = (arah: 1 | -1) => {
        if (jumlah < 2) {
            return;
        }

        setAktif((indeks) => (indeks + arah + jumlah) % jumlah);
    };

    return (
        <div className="space-y-2">
            <div
                className={cn(
                    'relative overflow-hidden rounded-xl bg-muted',
                    className,
                )}
            >
                {fotoAktif ? (
                    <img
                        src={fotoAktif.url}
                        alt={`${nama} - foto ${indeksAman + 1}`}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.3),transparent_55%),radial-gradient(circle_at_75%_80%,rgba(20,184,166,0.26),transparent_50%)]">
                        <span className="text-6xl drop-shadow-sm">
                            {icon ?? '🍱'}
                        </span>
                    </div>
                )}

                {children}

                {jumlah > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => geser(-1)}
                            aria-label="Foto sebelumnya"
                            className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => geser(1)}
                            aria-label="Foto berikutnya"
                            className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                        <span className="absolute right-3 bottom-3 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white tabular-nums">
                            {indeksAman + 1}/{jumlah}
                        </span>
                    </>
                )}
            </div>

            {jumlah > 1 && (
                <div
                    className="flex gap-2 overflow-x-auto pb-1"
                    aria-label={`Galeri foto ${nama}`}
                >
                    {daftar.map((foto, indeks) => (
                        <button
                            key={foto.id}
                            type="button"
                            onClick={() => setAktif(indeks)}
                            aria-label={`Lihat foto ${indeks + 1}`}
                            aria-pressed={indeks === indeksAman}
                            className={cn(
                                'relative size-14 shrink-0 overflow-hidden rounded-lg border-2 transition sm:size-16',
                                indeks === indeksAman
                                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                                    : 'border-transparent opacity-70 hover:opacity-100',
                            )}
                        >
                            <img
                                src={foto.url}
                                alt={`${nama} - thumbnail ${indeks + 1}`}
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
