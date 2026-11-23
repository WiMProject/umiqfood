export interface Kategori {
    id: number;
    nama: string;
    icon?: string | null;
    slug?: string;
    masakans_count?: number;
}

export interface Review {
    id: number;
    masakan_id: number;
    user_id: number | null;
    nama: string;
    rating: number;
    rating_bintang: string;
    komentar: string | null;
    terverifikasi: boolean;
    created_at: string;
}

export interface MasakanFoto {
    id: number;
    masakan_id: number;
    path: string;
    url: string;
    urutan: number;
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
    tampil_unggulan: boolean;
    jumlah_porsi: number;
    porsi_dipesan: number;
    porsi_tersedia: number;
    kategori_id: number;
    kategori?: Kategori;
    fotos?: MasakanFoto[];
    reviews?: Review[];
    reviews_count?: number;
    reviews_avg_rating?: number | string | null;
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
    diskon: number;
    diskon_format: string;
    kode_kupon: string | null;
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
    kupon?: Kupon | null;
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

export type KuponTipe = 'persen' | 'nominal';

export interface Kupon {
    id: number;
    kode: string;
    nama: string | null;
    tipe: KuponTipe;
    tipe_label: string;
    nilai: number;
    nilai_format: string;
    min_subtotal: number;
    maks_diskon: number | null;
    kuota: number | null;
    maks_per_user: number;
    mulai: string | null;
    selesai: string | null;
    aktif: boolean;
    total_pemakaian?: number;
    total_diskon?: number | null;
}

export type PengumumanJenis = 'promo' | 'info';

export interface Pengumuman {
    id: number;
    judul: string;
    slug: string;
    jenis: PengumumanJenis;
    jenis_label: string;
    ringkasan: string | null;
    isi: string | null;
    gambar: string | null;
    gambar_url: string | null;
    kupon_id: number | null;
    kode_kupon_aktif: string | null;
    kupon?: Kupon | null;
    mulai: string | null;
    selesai: string | null;
    aktif: boolean;
    urutan: number;
}

export interface Faq {
    id: number;
    pertanyaan: string;
    jawaban: string;
    urutan: number;
    aktif: boolean;
}

export interface PengaturanToko {
    id: number;
    nama_toko: string;
    tagline: string | null;
    alamat: string | null;
    jam_buka: string | null;
    jam_tutup: string | null;
    hari_tutup: string | null;
    whatsapp: string | null;
    instagram: string | null;
    maps_url: string | null;
    catatan_pickup: string | null;
    catatan_pembayaran: string | null;
}

export interface KuponPreview {
    kode: string;
    nama: string | null;
    diskon: number;
    total: number;
    subtotal: number;
}
