import { usePasskeyRegister } from '@laravel/passkeys/react';
import { KeyRound, LoaderCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    onSuccess: () => void;
};

export default function PasskeyRegistration({ onSuccess }: Props) {
    const [name, setName] = useState(() => {
        const ua = navigator.userAgent;

        const browser = [
            { pattern: /Edg|Edge/, name: 'Edge' },
            { pattern: /OPR|Opera|OPiOS/, name: 'Opera' },
            { pattern: /Firefox|FxiOS/, name: 'Firefox' },
            { pattern: /Chrome|CriOS/, name: 'Chrome' },
            { pattern: /Safari/, name: 'Safari' },
        ].find(({ pattern }) => pattern.test(ua))?.name;

        const os = [
            { pattern: /iPhone/, name: 'iPhone' },
            { pattern: /iPad|Macintosh(?=.*Mobile)/, name: 'iPad' },
            { pattern: /Android/, name: 'Android' },
            { pattern: /Mac/, name: 'Mac' },
            { pattern: /Windows/, name: 'Windows' },
        ].find(({ pattern }) => pattern.test(ua))?.name;

        return [browser, os].filter(Boolean).join(' di ') || '';
    });

    const [showForm, setShowForm] = useState(false);
    const { register, isLoading, error, isSupported } = usePasskeyRegister({
        onSuccess: () => {
            setName('');
            setShowForm(false);
            onSuccess();
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        await register(name);
    };

    const handleCancel = () => {
        setShowForm(false);
        setName('');
    };

    if (!isSupported) {
        return (
            <p className="text-sm text-muted-foreground">
                Passkey tidak didukung di browser ini.
            </p>
        );
    }

    if (!showForm) {
        return (
            <Button
                variant="outline"
                onClick={() => setShowForm(true)}
                className="h-10 gap-2 rounded-xl border-emerald-200 px-4 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200"
            >
                <Plus className="size-4" />
                Tambah passkey
            </Button>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-emerald-200/70 bg-emerald-50/30 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/15"
        >
            <div className="grid gap-2">
                <Label
                    htmlFor="passkey-name"
                    className="flex items-center gap-2"
                >
                    <KeyRound className="size-4 text-emerald-600 dark:text-emerald-400" />
                    Nama passkey
                </Label>
                <Input
                    id="passkey-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="mis. MacBook Pro, iPhone"
                    className="h-10"
                    autoFocus
                />
                <p className="text-xs text-muted-foreground">
                    Nama membantu mengenali passkey ini nanti.
                </p>
            </div>

            {error && <InputError message={error} />}

            <div className="flex flex-wrap gap-2">
                <Button
                    type="submit"
                    disabled={isLoading || !name.trim()}
                    className="h-10 gap-2 rounded-xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
                >
                    {isLoading ? (
                        <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                        <KeyRound className="size-4" />
                    )}
                    {isLoading ? 'Mendaftarkan...' : 'Daftarkan passkey'}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                    className="h-10 rounded-xl px-4"
                >
                    Batal
                </Button>
            </div>
        </form>
    );
}
