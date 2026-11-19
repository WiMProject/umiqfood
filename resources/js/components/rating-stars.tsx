import { Star } from 'lucide-react';
import { cn } from 'cn';

const ukuran = {
    sm: 'size-3.5',
    md: 'size-4',
    lg: 'size-5',
} as const;

export function RatingStars({
    value,
    size = 'sm',
    className,
}: {
    value: number;
    size?: keyof typeof ukuran;
    className?: string;
}) {
    const bulat = Math.round(value);

    return (
        <span
            className={cn('flex items-center gap-0.5', className)}
            aria-label={`${value} dari 5 bintang`}
        >
            {[1, 2, 3, 4, 5].map((bintang) => (
                <Star
                    key={bintang}
                    aria-hidden="true"
                    className={cn(
                        ukuran[size],
                        bintang <= bulat
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/35',
                    )}
                />
            ))}
        </span>
    );
}
