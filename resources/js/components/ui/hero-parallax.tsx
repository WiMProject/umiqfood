import { useRef, type ReactNode } from 'react';
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    type MotionValue,
} from 'motion/react';

import { cn } from 'cn';

export interface HeroParallaxProduct {
    id: string | number;
    title: string;
    link: string;
    subtitle?: string;
    description?: string;
    thumbnail?: string | null;
    emoji?: string;
    meta?: string;
    accent?: string;
}

const ROW_SIZE = 6;

const DEFAULT_ACCENT =
    'from-emerald-500 via-teal-500 to-emerald-700 dark:from-emerald-600 dark:via-teal-600 dark:to-emerald-800';

export function HeroParallax({
    products,
    header,
    className,
}: {
    products: HeroParallaxProduct[];
    header?: ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start'],
    });

    const springConfig = { stiffness: 260, damping: 28, bounce: 60 };

    const translateX = useSpring(
        useTransform(scrollYProgress, [0, 1], [0, 650]),
        springConfig,
    );
    const translateXReverse = useSpring(
        useTransform(scrollYProgress, [0, 1], [0, -650]),
        springConfig,
    );
    const rotateX = useSpring(
        useTransform(scrollYProgress, [0, 0.25], [18, 0]),
        springConfig,
    );
    const rotateZ = useSpring(
        useTransform(scrollYProgress, [0, 0.25], [8, 0]),
        springConfig,
    );
    const opacity = useSpring(
        useTransform(scrollYProgress, [0, 0.3], [0.2, 1]),
        springConfig,
    );
    const translateY = useSpring(
        useTransform(scrollYProgress, [0, 0.35], [-680, 80]),
        springConfig,
    );

    const rows: HeroParallaxProduct[][] = [];

    for (let index = 0; index < products.length; index += ROW_SIZE) {
        rows.push(products.slice(index, index + ROW_SIZE));
    }

    return (
        <section
            ref={ref}
            className={cn(
                'relative flex min-h-[190vh] flex-col self-auto overflow-hidden bg-background antialiased sm:min-h-[200vh] [perspective:1000px] [transform-style:preserve-3d]',
                className,
            )}
        >
            <div className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-600/10" />
            <div className="pointer-events-none absolute top-1/3 -left-32 size-96 rounded-full bg-teal-200/40 blur-3xl dark:bg-teal-600/10" />

            {header && (
                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-12 pb-6 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
                    {header}
                </div>
            )}

            <motion.div
                style={{ rotateX, rotateZ, translateY, opacity }}
                aria-hidden="true"
                className="relative z-0 mt-6 flex flex-col gap-6 pb-16 sm:mt-10 sm:gap-8"
            >
                {rows.map((row, rowIndex) => {
                    const isReversed = rowIndex % 2 === 0;

                    return (
                        <div key={rowIndex} className="flex justify-center">
                            <div
                                className={cn(
                                    'flex w-max gap-4 sm:gap-6 lg:gap-8',
                                    isReversed
                                        ? 'flex-row-reverse'
                                        : 'flex-row',
                                )}
                            >
                                {row.map((product) => (
                                    <ProductCard
                                        key={`${rowIndex}-${product.id}`}
                                        product={product}
                                        translate={
                                            isReversed
                                                ? translateX
                                                : translateXReverse
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </motion.div>
        </section>
    );
}

export function ProductCard({
    product,
    translate,
}: {
    product: HeroParallaxProduct;
    translate: MotionValue<number>;
}) {
    return (
        <motion.div
            style={{ x: translate }}
            whileHover={{ y: -12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="group/product relative h-60 w-72 shrink-0 overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-emerald-950/20 sm:h-72 sm:w-96 lg:h-80 lg:w-[26rem]"
        >
            <a
                href={product.link}
                tabIndex={-1}
                className="block h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
                <div
                    className={cn(
                        'relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br p-5 text-white sm:p-6',
                        product.accent ?? DEFAULT_ACCENT,
                    )}
                >
                    {product.thumbnail && (
                        <>
                            <img
                                src={product.thumbnail}
                                alt={product.title}
                                loading="lazy"
                                width={600}
                                height={600}
                                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover/product:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                        </>
                    )}

                    <div className="relative flex items-start justify-between gap-3">
                        <span className="text-4xl drop-shadow-sm sm:text-5xl">
                            {product.emoji ?? '🍱'}
                        </span>
                        {product.meta && (
                            <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap backdrop-blur">
                                {product.meta}
                            </span>
                        )}
                    </div>

                    <div className="relative">
                        {product.subtitle && (
                            <p className="text-[11px] font-semibold tracking-[0.18em] text-white/75 uppercase">
                                {product.subtitle}
                            </p>
                        )}
                        <h3 className="mt-1 text-xl font-extrabold tracking-tight drop-shadow-sm sm:text-2xl">
                            {product.title}
                        </h3>
                        {product.description && (
                            <p className="mt-1 line-clamp-1 text-sm text-white/80">
                                {product.description}
                            </p>
                        )}
                    </div>
                </div>
            </a>
        </motion.div>
    );
}
