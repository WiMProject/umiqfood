import { Form } from '@inertiajs/react';
import { LoaderCircle, Trash2, TriangleAlert } from 'lucide-react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-500/15 dark:bg-red-950/40 dark:text-red-300">
                    <TriangleAlert className="size-[18px]" />
                </span>
                <div>
                    <h2 className="font-semibold">Hapus akun</h2>
                    <p className="text-xs text-muted-foreground">
                        Hapus akun dan seluruh data yang terkait.
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-red-200/70 bg-red-50/60 p-5 dark:border-red-900/60 dark:bg-red-950/25">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300">
                        <TriangleAlert className="size-5" />
                    </span>
                    <div>
                        <p className="font-semibold text-red-800 dark:text-red-200">
                            Perhatian
                        </p>
                        <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/80">
                            Tindakan ini tidak bisa dibatalkan. Pesanan,
                            keranjang, dan riwayat pembayaran kamu akan ikut
                            terhapus.
                        </p>
                    </div>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                            className="mt-4 gap-2 rounded-xl"
                        >
                            <Trash2 className="size-4" />
                            Hapus akun
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Yakin ingin menghapus akun?</DialogTitle>
                        <DialogDescription>
                            Seluruh data pesanan, keranjang, dan pembayaran akan
                            dihapus permanen. Masukkan kata sandi kamu untuk
                            melanjutkan.
                        </DialogDescription>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-6"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password"
                                            className="sr-only"
                                        >
                                            Kata sandi
                                        </Label>

                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Kata sandi saat ini"
                                            autoComplete="current-password"
                                        />

                                        <InputError message={errors.password} />
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose asChild>
                                            <Button
                                                variant="secondary"
                                                onClick={() =>
                                                    resetAndClearErrors()
                                                }
                                                className="rounded-xl"
                                            >
                                                Batal
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            variant="destructive"
                                            disabled={processing}
                                            asChild
                                            className="rounded-xl"
                                        >
                                            <button
                                                type="submit"
                                                data-test="confirm-delete-user-button"
                                                className="flex items-center gap-2"
                                            >
                                                {processing && (
                                                    <LoaderCircle className="size-4 animate-spin" />
                                                )}
                                                Ya, hapus akun
                                            </button>
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
