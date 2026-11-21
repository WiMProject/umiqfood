<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Tampilkan daftar akun pengguna dan admin.
     */
    public function index(Request $request): Response
    {
        $users = User::query()
            ->withCount('orders')
            ->orderByRaw("CASE WHEN role = 'admin' THEN 0 ELSE 1 END")
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/users/index', [
            'users' => $users->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'email_verified_at' => $user->email_verified_at?->toIso8601String(),
                'orders_count' => (int) $user->orders_count,
                'created_at' => $user->created_at?->toIso8601String(),
                'is_self' => $user->is($request->user()),
            ])->values(),
            'stats' => [
                'total' => $users->count(),
                'admin' => $users->where('role', 'admin')->count(),
                'user' => $users->where('role', 'user')->count(),
                'belum_verifikasi' => $users->whereNull('email_verified_at')->count(),
            ],
        ]);
    }

    /**
     * Simpan akun baru dari panel admin.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'role' => ['required', Rule::in(['admin', 'user'])],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create($validated);
        $user->forceFill(['email_verified_at' => now()])->save();

        return $this->toast('success', 'Pengguna berhasil ditambahkan.');
    }

    /**
     * Perbarui data akun pengguna.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($user),
            ],
            'role' => ['required', Rule::in(['admin', 'user'])],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        if ($user->is($request->user()) && $validated['role'] !== 'admin') {
            return $this->toast(
                'error',
                'Kamu tidak bisa menurunkan peran akun sendiri.'
            );
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];

        if (filled($validated['password'] ?? null)) {
            $user->password = $validated['password'];
        }

        $user->save();

        return $this->toast('success', 'Data pengguna berhasil diperbarui.');
    }

    /**
     * Hapus akun yang belum memiliki riwayat pesanan.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            return $this->toast('error', 'Kamu tidak bisa menghapus akun sendiri.');
        }

        if ($user->orders()->exists()) {
            return $this->toast(
                'error',
                'Pengguna ini masih punya riwayat pesanan dan tidak bisa dihapus.'
            );
        }

        $user->delete();

        return $this->toast('success', 'Pengguna berhasil dihapus.');
    }

    /**
     * Tandai email pengguna sebagai terverifikasi.
     */
    public function verify(User $user): RedirectResponse
    {
        if ($user->hasVerifiedEmail()) {
            return $this->toast('success', 'Email pengguna sudah terverifikasi.');
        }

        $user->forceFill(['email_verified_at' => now()])->save();

        return $this->toast('success', 'Email pengguna berhasil diverifikasi.');
    }

    /**
     * Kirim notifikasi toast lewat Inertia lalu kembali ke halaman sebelumnya.
     */
    private function toast(string $type, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);

        return back();
    }
}
