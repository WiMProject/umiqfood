import { Head, router, useForm } from '@inertiajs/react';
import {
    BadgeCheck,
    LoaderCircle,
    LockKeyhole,
    MailCheck,
    MailWarning,
    Pencil,
    Plus,
    Save,
    Search,
    ShieldCheck,
    Trash2,
    UserRound,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import {
    AdminTableCard,
    StatusPill,
    TableAction,
    TableHead,
} from '@/components/admin-table';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';

type Role = 'admin' | 'user';
type RoleFilter = 'semua' | Role;

interface ManagedUser {
    id: number;
    name: string;
    email: string;
    role: Role;
    email_verified_at: string | null;
    orders_count: number;
    created_at: string | null;
    is_self: boolean;
}

interface Props {
    users: ManagedUser[];
    stats: {
        total: number;
        admin: number;
        user: number;
        belum_verifikasi: number;
    };
}

const FILTER_PERAN: { value: RoleFilter; label: string }[] = [
    { value: 'semua', label: 'Semua' },
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'Pelanggan' },
];

function formatTanggal(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function roleLabel(role: Role): string {
    return role === 'admin' ? 'Admin' : 'Pelanggan';
}

export default function AdminUsersIndex({ users, stats }: Props) {
    const getInitials = useInitials();

    const [cari, setCari] = useState('');
    const [filterPeran, setFilterPeran] = useState<RoleFilter>('semua');
    const [isOpen, setIsOpen] = useState(false);
    const [editing, setEditing] = useState<ManagedUser | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<{
            name: string;
            email: string;
            role: Role;
            password: string;
            password_confirmation: string;
        }>({
            name: '',
            email: '',
            role: 'user',
            password: '',
            password_confirmation: '',
        });

    const hasil = useMemo(() => {
        const kataKunci = cari.trim().toLowerCase();

        return users.filter((user) => {
            const cocokPeran =
                filterPeran === 'semua' || user.role === filterPeran;
            const cocokCari =
                kataKunci === '' ||
                user.name.toLowerCase().includes(kataKunci) ||
                user.email.toLowerCase().includes(kataKunci);

            return cocokPeran && cocokCari;
        });
    }, [users, filterPeran, cari]);

    const kartu = [
        {
            label: 'Total pengguna',
            value: stats.total,
            hint: 'Admin dan pelanggan',
            icon: Users,
            warna: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
        },
        {
            label: 'Admin',
            value: stats.admin,
            hint: 'Akses penuh panel',
            icon: ShieldCheck,
            warna: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
        },
        {
            label: 'Pelanggan',
            value: stats.user,
            hint: 'Akun pemesan pickup',
            icon: UserRound,
            warna: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300',
        },
        {
            label: 'Belum verifikasi',
            value: stats.belum_verifikasi,
            hint: 'Email belum aktif',
            icon: MailWarning,
            warna: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
        },
    ];

    const bukaTambah = () => {
        setEditing(null);
        reset();
        clearErrors();
        setIsOpen(true);
    };

    const bukaEdit = (user: ManagedUser) => {
        setEditing(user);
        setData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
            password_confirmation: '',
        });
        clearErrors();
        setIsOpen(true);
    };

    const tutupDialog = () => {
        setIsOpen(false);
        setEditing(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (editing) {
            put(`/users/${editing.id}`, {
                preserveScroll: true,
                onSuccess: () => tutupDialog(),
            });

            return;
        }

        post('/users', {
            preserveScroll: true,
            onSuccess: () => tutupDialog(),
        });
    };

    const verifikasi = (user: ManagedUser) => {
        router.post(
            `/users/${user.id}/verifikasi`,
            {},
            { preserveScroll: true },
        );
    };

    const hapus = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(`/users/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const bisaDihapus = (user: ManagedUser) =>
        !user.is_self && user.orders_count === 0;

    return (
        <>
            <Head title="Manajemen Pengguna" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-600 uppercase dark:text-emerald-400">
                            Pengguna
                        </p>
                        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
                            Manajemen pengguna
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola akun admin dan pelanggan UmiqFood, termasuk
                            peran dan status verifikasi email.
                        </p>
                    </div>
                    <Button
                        onClick={bukaTambah}
                        className="gap-2 self-start bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 sm:self-auto"
                    >
                        <Plus className="size-4" />
                        Tambah pengguna
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {kartu.map((item) => (
                        <Card key={item.label} className="gap-1 p-4">
                            <span
                                className={cn(
                                    'flex size-9 items-center justify-center rounded-xl',
                                    item.warna,
                                )}
                            >
                                <item.icon className="size-4.5" />
                            </span>
                            <p className="mt-2 truncate text-xl font-extrabold tracking-tight">
                                {item.value}
                            </p>
                            <p className="text-xs font-medium text-muted-foreground">
                                {item.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground/80">
                                {item.hint}
                            </p>
                        </Card>
                    ))}
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-1.5">
                        {FILTER_PERAN.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setFilterPeran(item.value)}
                                className={cn(
                                    'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
                                    filterPeran === item.value
                                        ? 'border-emerald-600 bg-emerald-600 text-white'
                                        : 'border-border/80 bg-card text-muted-foreground hover:border-emerald-300',
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full lg:max-w-xs">
                        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={cari}
                            onChange={(event) => setCari(event.target.value)}
                            placeholder="Cari nama atau email..."
                            className="h-10 rounded-xl bg-card pl-10"
                        />
                    </div>
                </div>

                <AdminTableCard
                    title="Daftar pengguna"
                    description="Peran, status verifikasi, dan riwayat pesanan setiap akun."
                    count={hasil.length}
                    icon={Users}
                    className="hidden xl:block"
                >
                    <table className="w-full table-fixed text-left text-sm">
                        <thead className="border-b border-border/70 bg-muted/30">
                            <tr>
                                <TableHead className="w-[38%]">
                                    Pengguna
                                </TableHead>
                                <TableHead align="center" className="w-[12%]">
                                    Peran
                                </TableHead>
                                <TableHead align="center" className="w-[16%]">
                                    Status
                                </TableHead>
                                <TableHead align="center" className="w-[11%]">
                                    Pesanan
                                </TableHead>
                                <TableHead align="center" className="w-[13%]">
                                    Terdaftar
                                </TableHead>
                                <TableHead align="center" className="w-[10%]">
                                    Aksi
                                </TableHead>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {hasil.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-14 text-center"
                                    >
                                        <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                                            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                                                <Users className="size-5" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">
                                                Tidak ada pengguna
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Coba ubah kata kunci atau filter
                                                peran.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                hasil.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10"
                                    >
                                        <td className="px-4 py-3.5">
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white">
                                                    {getInitials(user.name)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="truncate font-semibold text-foreground">
                                                            {user.name}
                                                        </p>
                                                        {user.is_self && (
                                                            <span className="shrink-0 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                                                                Kamu
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <StatusPill
                                                tone={
                                                    user.role === 'admin'
                                                        ? 'emerald'
                                                        : 'slate'
                                                }
                                                icon={
                                                    user.role === 'admin'
                                                        ? ShieldCheck
                                                        : UserRound
                                                }
                                            >
                                                {roleLabel(user.role)}
                                            </StatusPill>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            {user.email_verified_at ? (
                                                <StatusPill
                                                    tone="emerald"
                                                    icon={BadgeCheck}
                                                >
                                                    Terverifikasi
                                                </StatusPill>
                                            ) : (
                                                <StatusPill
                                                    tone="amber"
                                                    icon={MailWarning}
                                                >
                                                    Belum verifikasi
                                                </StatusPill>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <StatusPill tone="slate">
                                                {user.orders_count} pesanan
                                            </StatusPill>
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-xs text-muted-foreground">
                                            {formatTanggal(user.created_at)}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {!user.email_verified_at && (
                                                    <TableAction
                                                        label={`Verifikasi ${user.name}`}
                                                        icon={MailCheck}
                                                        tone="emerald"
                                                        onClick={() =>
                                                            verifikasi(user)
                                                        }
                                                    />
                                                )}
                                                <TableAction
                                                    label={`Edit ${user.name}`}
                                                    icon={Pencil}
                                                    onClick={() =>
                                                        bukaEdit(user)
                                                    }
                                                />
                                                {bisaDihapus(user) && (
                                                    <TableAction
                                                        label={`Hapus ${user.name}`}
                                                        icon={Trash2}
                                                        tone="rose"
                                                        onClick={() =>
                                                            setDeleteTarget(
                                                                user,
                                                            )
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </AdminTableCard>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:hidden">
                    {hasil.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border/70 bg-card p-8 text-center md:col-span-2">
                            <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                                    <Users className="size-5" />
                                </div>
                                <p className="text-sm font-medium text-foreground">
                                    Tidak ada pengguna
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Coba ubah kata kunci atau filter peran.
                                </p>
                            </div>
                        </div>
                    ) : (
                        hasil.map((user) => (
                            <Card key={user.id} className="gap-0 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-semibold text-white">
                                        {getInitials(user.name)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <p className="truncate font-semibold">
                                                {user.name}
                                            </p>
                                            {user.is_self && (
                                                <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                                                    Kamu
                                                </span>
                                            )}
                                        </div>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {user.email}
                                        </p>

                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            <StatusPill
                                                tone={
                                                    user.role === 'admin'
                                                        ? 'emerald'
                                                        : 'slate'
                                                }
                                                icon={
                                                    user.role === 'admin'
                                                        ? ShieldCheck
                                                        : UserRound
                                                }
                                            >
                                                {roleLabel(user.role)}
                                            </StatusPill>
                                            {user.email_verified_at ? (
                                                <StatusPill
                                                    tone="emerald"
                                                    icon={BadgeCheck}
                                                >
                                                    Terverifikasi
                                                </StatusPill>
                                            ) : (
                                                <StatusPill
                                                    tone="amber"
                                                    icon={MailWarning}
                                                >
                                                    Belum verifikasi
                                                </StatusPill>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
                                    <span>{user.orders_count} pesanan</span>
                                    <span>
                                        Sejak {formatTanggal(user.created_at)}
                                    </span>
                                </div>

                                <div className="mt-3 flex items-center justify-end gap-1.5">
                                    {!user.email_verified_at && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => verifikasi(user)}
                                            className="h-8 gap-1.5 rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                                        >
                                            <MailCheck className="size-3.5" />
                                            Verifikasi
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => bukaEdit(user)}
                                        className="h-8 gap-1.5 rounded-lg"
                                    >
                                        <Pencil className="size-3.5" />
                                        Edit
                                    </Button>
                                    {bisaDihapus(user) && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setDeleteTarget(user)
                                            }
                                            className="h-8 gap-1.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                                        >
                                            <Trash2 className="size-3.5" />
                                            Hapus
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (open) {
                        setIsOpen(true);

                        return;
                    }

                    tutupDialog();
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit pengguna' : 'Tambah pengguna'}
                        </DialogTitle>
                        <DialogDescription>
                            {editing
                                ? 'Perbarui nama, email, peran, atau kata sandi akun.'
                                : 'Buat akun admin atau pelanggan baru. Email langsung dianggap terverifikasi.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="user-name">Nama lengkap</Label>
                            <Input
                                id="user-name"
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                placeholder="Nama pengguna"
                                autoComplete="name"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="user-email">Alamat email</Label>
                            <Input
                                id="user-email"
                                type="email"
                                value={data.email}
                                onChange={(event) =>
                                    setData('email', event.target.value)
                                }
                                placeholder="nama@email.com"
                                autoComplete="email"
                                required
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="user-role">Peran</Label>
                            <select
                                id="user-role"
                                value={data.role}
                                onChange={(event) =>
                                    setData('role', event.target.value as Role)
                                }
                                disabled={editing?.is_self}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-input/30"
                                required
                            >
                                <option value="user">Pelanggan</option>
                                <option value="admin">Admin</option>
                            </select>
                            {editing?.is_self ? (
                                <p className="text-xs text-muted-foreground">
                                    Peran akun sendiri tidak bisa diubah.
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    Admin dapat mengakses seluruh panel
                                    pengelolaan.
                                </p>
                            )}
                            <InputError message={errors.role} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="user-password">
                                {editing
                                    ? 'Kata sandi baru (opsional)'
                                    : 'Kata sandi'}
                            </Label>
                            <PasswordInput
                                id="user-password"
                                name="password"
                                value={data.password}
                                onChange={(event) =>
                                    setData('password', event.target.value)
                                }
                                placeholder={
                                    editing
                                        ? 'Biarkan kosong jika tidak diganti'
                                        : 'Minimal 8 karakter'
                                }
                                autoComplete="new-password"
                                icon={<LockKeyhole />}
                                className="h-10"
                                required={!editing}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="user-password-confirmation">
                                Konfirmasi kata sandi
                            </Label>
                            <PasswordInput
                                id="user-password-confirmation"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(event) =>
                                    setData(
                                        'password_confirmation',
                                        event.target.value,
                                    )
                                }
                                placeholder="Ulangi kata sandi"
                                autoComplete="new-password"
                                icon={<LockKeyhole />}
                                className="h-10"
                                required={!editing}
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={tutupDialog}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                {processing ? (
                                    <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                    <Save className="size-4" />
                                )}
                                {editing
                                    ? 'Simpan perubahan'
                                    : 'Tambah pengguna'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTarget(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus pengguna ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Akun {deleteTarget?.name} ({deleteTarget?.email})
                            akan dihapus permanen. Tindakan ini tidak bisa
                            dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Tidak</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={hapus}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Ya, hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

AdminUsersIndex.layout = {
    breadcrumbs: [{ title: 'Manajemen User', href: '/users' }],
};
