export interface Kategori {
    id: number;
    nama: string;
    icon?: string | null;
    slug?: string;
    masakans_count?: number;
}

export interface Masakan {
    id: number;
    nama: string;
    deskripsi: string | null;
    harga: number;
    harga_format: string;
    foto: string | null;
    foto_url: string | null;
    tersedia: boolean;
    jumlah_porsi: number;
    kategori_id: number;
    kategori?: Kategori;
}

export interface CartItem {
    id: number;
    user_id: number;
    masakan_id: number;
    jumlah: number;
    subtotal: number;
    subtotal_format: string;
    masakan?: Masakan;
}

export interface OrderItem {
    id: number;
    order_id: number;
    masakan_id: number | null;
    nama_menu: string;
    harga: number;
    harga_format: string;
    jumlah: number;
    subtotal: number;
    subtotal_format: string;
}

export type OrderStatus =
    | 'menunggu'
    | 'dimasak'
    | 'siap'
    | 'selesai'
    | 'dibatalkan';

export type MetodePembayaran = 'cash' | 'qris';

export interface Order {
    id: number;
    user_id: number;
    kode: string;
    tanggal: string;
    tanggal_format: string;
    nomor_antrian: number;
    antrian_format: string;
    status: OrderStatus;
    status_label: string;
    metode_pembayaran: MetodePembayaran;
    metode_pembayaran_label: string;
    subtotal: number;
    total: number;
    total_format: string;
    nama_pengambil: string;
    no_hp: string;
    catatan: string | null;
    estimasi_siap_at: string | null;
    siap_at: string | null;
    diambil_at: string | null;
    dibatalkan_at: string | null;
    created_at: string;
    items: OrderItem[];
    payment?: Payment | null;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface Payment {
    id: number;
    order_id: number;
    kode: string;
    metode: MetodePembayaran;
    metode_label: string;
    jumlah: number;
    jumlah_format: string;
    status: 'menunggu' | 'berhasil' | 'gagal';
    status_label: string;
    dibayar_at: string | null;
    created_at: string;
    order?: Order;
}

export interface KeranjangRingkas {
    jumlah: number;
    subtotal: number;
}
