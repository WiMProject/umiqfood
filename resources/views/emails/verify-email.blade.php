@extends('emails.layout', ['title' => 'Verifikasi email UmiqFood'])

@section('hero_title', 'Verifikasi email')
@section('hero_subtitle', 'Aktifkan akun kamu untuk mulai memesan.')

@section('content')
    <h2 class="greeting" style="margin:0 0 16px;color:#064e3b;font-size:18px;font-weight:700;">
        Halo, {{ $userName }}! 👋
    </h2>

    <p class="text" style="margin:0 0 18px;color:#4b5563;font-size:15px;">
        Terima kasih sudah mendaftar di <strong style="color:#047857;">UmiqFood</strong>.
        Verifikasi alamat email dulu ya, supaya akunmu aman dan kamu bisa mulai
        memesan masakan rumahan untuk diambil saat siap.
    </p>

    <div class="button-wrap" style="margin:28px 0;text-align:center;">
        <a href="{{ $verificationUrl }}" class="button" target="_blank" rel="noopener" style="display:inline-block;padding:14px 30px;border-radius:12px;background-color:#059669;box-shadow:0 10px 20px -10px rgba(5,150,105,0.75);color:#ffffff !important;font-size:15px;font-weight:700;text-decoration:none;">
            Verifikasi email saya
        </a>
    </div>

    <div class="note" style="margin:0 0 24px;padding:14px 18px;border-left:4px solid #10b981;border-radius:10px;background-color:#ecfdf5;color:#065f46;font-size:13px;">
        ⏱️ <strong style="color:#047857;">Batas waktu:</strong> tautan ini berlaku
        selama <strong style="color:#047857;">60 menit</strong>. Kalau sudah
        kadaluarsa, minta tautan baru lewat halaman masuk.
    </div>

    <p class="text muted" style="margin:0 0 18px;color:#6b7280;font-size:13px;">
        Kalau kamu tidak merasa mendaftar di UmiqFood, abaikan email ini saja.
        Tidak ada tindakan lain yang perlu dilakukan.
    </p>

    <div class="divider" style="height:1px;margin:26px 0 22px;background-color:#e5e7eb;"></div>

    <p class="fallback" style="margin:0;color:#6b7280;font-size:12px;line-height:1.7;word-break:break-all;">
        Kalau tombol di atas tidak bekerja, salin dan tempel tautan ini ke
        peramban kamu:<br>
        <a href="{{ $verificationUrl }}" style="color:#047857;">{{ $verificationUrl }}</a>
    </p>
@endsection
