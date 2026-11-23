export function formatRupiah(value: number): string {
    return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
}

function bagianTanggal(value: string): string {
    return value.trim().slice(0, 10);
}

export function formatTanggal(value: string | null): string {
    if (!value) {
        return '-';
    }

    const tanggal = new Date(`${bagianTanggal(value)}T00:00:00`);

    if (Number.isNaN(tanggal.getTime())) {
        return '-';
    }

    return tanggal.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function periodeTeks(
    mulai: string | null,
    selesai: string | null,
): string {
    if (!mulai && !selesai) {
        return 'Tanpa batas waktu';
    }

    if (mulai && selesai) {
        return `${formatTanggal(mulai)} – ${formatTanggal(selesai)}`;
    }

    if (mulai) {
        return `Mulai ${formatTanggal(mulai)}`;
    }

    return `Sampai ${formatTanggal(selesai)}`;
}

export function statusPeriode(
    mulai: string | null,
    selesai: string | null,
): 'aktif' | 'belum' | 'lewat' {
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    if (mulai) {
        const awal = new Date(`${bagianTanggal(mulai)}T00:00:00`);

        if (!Number.isNaN(awal.getTime()) && hariIni < awal) {
            return 'belum';
        }
    }

    if (selesai) {
        const akhir = new Date(`${bagianTanggal(selesai)}T23:59:59`);

        if (!Number.isNaN(akhir.getTime()) && hariIni > akhir) {
            return 'lewat';
        }
    }

    return 'aktif';
}
