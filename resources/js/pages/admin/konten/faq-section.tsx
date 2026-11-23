import { router, useForm } from '@inertiajs/react';
import {
    ChevronDown,
    HelpCircle,
    Pencil,
    Plus,
    Power,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { StatusPill } from '@/components/admin-table';
import InputError from '@/components/input-error';
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
import { cn } from '@/lib/utils';
import type { Faq } from '@/types';

interface Props {
    faqs: Faq[];
}

interface FormFaq {
    pertanyaan: string;
    jawaban: string;
    urutan: string;
    aktif: boolean;
}

const FORM_KOSONG: FormFaq = {
    pertanyaan: '',
    jawaban: '',
    urutan: '0',
    aktif: true,
};

export function FaqSection({ faqs }: Props) {
    const [dialogTerbuka, setDialogTerbuka] = useState(false);
    const [editing, setEditing] = useState<Faq | null>(null);
    const [hapusTarget, setHapusTarget] = useState<Faq | null>(null);
    const [terbuka, setTerbuka] = useState<number | null>(null);

    const {
        data,
        setData,
        post,
        patch,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm<FormFaq>(FORM_KOSONG);

    const bukaTambah = () => {
        setEditing(null);
        reset();
        clearErrors();
        setDialogTerbuka(true);
    };

    const bukaEdit = (faq: Faq) => {
        setEditing(faq);
        setData({
            pertanyaan: faq.pertanyaan,
            jawaban: faq.jawaban,
            urutan: String(faq.urutan),
            aktif: faq.aktif,
        });
        clearErrors();
        setDialogTerbuka(true);
    };

    const tutupDialog = () => {
        setDialogTerbuka(false);
        setEditing(null);
        reset();
        clearErrors();
    };

    const simpan = (event: React.FormEvent) => {
        event.preventDefault();

        const opsi = {
            preserveScroll: true,
            onSuccess: () => tutupDialog(),
        };

        if (editing) {
            patch(`/konten/faq/${editing.id}`, opsi);

            return;
        }

        post('/konten/faq', opsi);
    };

    const toggle = (faq: Faq) => {
        router.patch(
            `/konten/faq/${faq.id}/toggle`,
            {},
            { preserveScroll: true },
        );
    };

    const hapus = () => {
        if (!hapusTarget) {
            return;
        }

        router.delete(`/konten/faq/${hapusTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => setHapusTarget(null),
        });
    };

    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">
                        Pertanyaan umum
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                        Tampil di bagian FAQ halaman utama. Semua pertanyaan
                        aktif dimuat otomatis.
                    </p>
                </div>
                <Button
                    type="button"
                    onClick={bukaTambah}
                    className="h-10 gap-2 rounded-xl bg-emerald-600 px-4 text-white hover:bg-emerald-700"
                >
                    <Plus className="size-4" />
                    Tambah FAQ
                </Button>
            </div>

            {faqs.length === 0 ? (
                <Card className="mt-4 rounded-2xl border-dashed p-10 text-center">
                    <HelpCircle className="mx-auto size-8 text-muted-foreground" />
                    <p className="mt-3 text-sm font-semibold">
                        Belum ada pertanyaan
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Tambahkan pertanyaan yang sering ditanyakan pelanggan.
                    </p>
                </Card>
            ) : (
                <div className="mt-4 grid gap-2.5">
                    {faqs.map((faq) => (
                        <Card
                            key={faq.id}
                            className={cn(
                                'overflow-hidden rounded-2xl border-border/70 shadow-sm',
                                !faq.aktif && 'opacity-70',
                            )}
                        >
                            <div className="flex items-start gap-3 p-4">
                                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                    <HelpCircle className="size-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <StatusPill
                                            tone={
                                                faq.aktif ? 'emerald' : 'slate'
                                            }
                                        >
                                            {faq.aktif
                                                ? 'Tampil'
                                                : 'Disembunyikan'}
                                        </StatusPill>
                                        <span className="text-[11px] text-muted-foreground">
                                            Urutan {faq.urutan}
                                        </span>
                                    </div>
                                    <p className="mt-1.5 text-sm font-semibold text-foreground">
                                        {faq.pertanyaan}
                                    </p>

                                    <div
                                        className={cn(
                                            'grid transition-all',
                                            terbuka === faq.id
                                                ? 'grid-rows-[1fr] opacity-100'
                                                : 'grid-rows-[0fr] opacity-0',
                                        )}
                                    >
                                        <p className="overflow-hidden text-xs leading-relaxed text-muted-foreground">
                                            <span className="block pt-1.5">
                                                {faq.jawaban}
                                            </span>
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => bukaEdit(faq)}
                                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-300"
                                    >
                                        <Pencil className="size-3" />
                                        Edit pertanyaan
                                    </button>
                                </div>

                                <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() => toggle(faq)}
                                        title={
                                            faq.aktif
                                                ? 'Sembunyikan'
                                                : 'Tampilkan'
                                        }
                                        className={cn(
                                            'flex size-8 items-center justify-center rounded-lg border border-border/70 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300',
                                            faq.aktif &&
                                                'text-emerald-600 dark:text-emerald-400',
                                        )}
                                    >
                                        <Power className="size-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setHapusTarget(faq)}
                                        title="Hapus FAQ"
                                        className="flex size-8 items-center justify-center rounded-lg border border-border/70 text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
                                    >
                                        <Trash2 className="size-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setTerbuka(
                                                terbuka === faq.id
                                                    ? null
                                                    : faq.id,
                                            )
                                        }
                                        title="Lihat jawaban"
                                        className="flex size-8 items-center justify-center rounded-lg border border-border/70 text-muted-foreground transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                                    >
                                        <ChevronDown
                                            className={cn(
                                                'size-4 transition-transform',
                                                terbuka === faq.id &&
                                                    'rotate-180',
                                            )}
                                        />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog
                open={dialogTerbuka}
                onOpenChange={(open) => !open && tutupDialog()}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit FAQ' : 'Tambah FAQ'}
                        </DialogTitle>
                        <DialogDescription>
                            Jawab pertanyaan pelanggan dengan singkat dan jelas.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={simpan} className="grid gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="faq-pertanyaan">Pertanyaan</Label>
                            <Input
                                id="faq-pertanyaan"
                                value={data.pertanyaan}
                                onChange={(event) =>
                                    setData('pertanyaan', event.target.value)
                                }
                                placeholder="Contoh: Bagaimana cara mengambil pesanan?"
                                className="h-10 rounded-xl"
                            />
                            <InputError message={errors.pertanyaan} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="faq-jawaban">Jawaban</Label>
                            <textarea
                                id="faq-jawaban"
                                value={data.jawaban}
                                onChange={(event) =>
                                    setData('jawaban', event.target.value)
                                }
                                rows={4}
                                placeholder="Tulis jawaban yang mudah dipahami."
                                className="w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                            />
                            <InputError message={errors.jawaban} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="faq-urutan">Urutan tampil</Label>
                            <Input
                                id="faq-urutan"
                                type="number"
                                min={0}
                                value={data.urutan}
                                onChange={(event) =>
                                    setData('urutan', event.target.value)
                                }
                                className="h-10 rounded-xl"
                            />
                            <InputError message={errors.urutan} />
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.aktif}
                                onChange={(event) =>
                                    setData('aktif', event.target.checked)
                                }
                                className="size-4 rounded border-input accent-emerald-600"
                            />
                            Tampilkan di halaman utama
                        </label>

                        <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={tutupDialog}
                                className="rounded-xl"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan FAQ'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={hapusTarget !== null}
                onOpenChange={(open) => !open && setHapusTarget(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Hapus FAQ?</DialogTitle>
                        <DialogDescription>
                            Pertanyaan &quot;{hapusTarget?.pertanyaan}&quot;
                            akan dihapus permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setHapusTarget(null)}
                            className="rounded-xl"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={hapus}
                            className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                        >
                            Hapus
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
