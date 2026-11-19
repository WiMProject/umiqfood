export type AuthShowcaseMenu = {
    id: number;
    nama: string;
    harga_format: string;
    kategori: string | null;
    icon: string | null;
    reviews_count: number;
    reviews_avg_rating: number | string | null;
};

export type AuthShowcaseReview = {
    id: number;
    nama: string;
    komentar: string;
    rating: number;
    menu: string | null;
    terverifikasi: boolean;
};

export type AuthShowcase = {
    menus: AuthShowcaseMenu[];
    reviews: AuthShowcaseReview[];
};
