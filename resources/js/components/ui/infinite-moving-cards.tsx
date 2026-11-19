import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type InfiniteMovingCardsSpeed = 'fast' | 'normal' | 'slow';

type InfiniteMovingCardsProps<T> = {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    direction?: 'left' | 'right';
    speed?: InfiniteMovingCardsSpeed;
    pauseOnHover?: boolean;
    className?: string;
    listClassName?: string;
    itemClassName?: string;
    ariaLabel?: string;
};

const DURASI: Record<InfiniteMovingCardsSpeed, string> = {
    fast: '20s',
    normal: '40s',
    slow: '80s',
};

/**
 * Marquee horizontal tanpa henti, diadaptasi dari Aceternity Infinite Moving Cards.
 *
 * Item dirender dua kali agar animasi menyambung mulus. Salinan kedua
 * disembunyikan dari pembaca layar supaya ulasan tidak dibacakan ganda.
 */
export function InfiniteMovingCards<T>({
    items,
    renderItem,
    direction = 'left',
    speed = 'normal',
    pauseOnHover = true,
    className,
    listClassName,
    itemClassName,
    ariaLabel,
}: InfiniteMovingCardsProps<T>) {
    if (items.length === 0) {
        return null;
    }

    const style = {
        '--animation-duration': DURASI[speed],
        '--animation-direction':
            direction === 'right' ? 'reverse' : 'forwards',
    } as CSSProperties;

    return (
        <div
            className={cn(
                'scroller relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_12%,white_88%,transparent)]',
                className,
            )}
        >
            <ul
                aria-label={ariaLabel}
                className={cn(
                    'flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-2',
                    'animate-scroll motion-reduce:animate-none',
                    pauseOnHover && 'hover:[animation-play-state:paused]',
                    listClassName,
                )}
                style={style}
            >
                {[...items, ...items].map((item, index) => (
                    <li
                        key={index}
                        className={cn('shrink-0', itemClassName)}
                        aria-hidden={index >= items.length || undefined}
                    >
                        {renderItem(item, index % items.length)}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default InfiniteMovingCards;
