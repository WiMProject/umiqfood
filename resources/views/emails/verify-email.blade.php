<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Alamat Email Anda</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f6f8fb;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #333333;
            line-height: 1.6;
        }
        .container {
            max-width: 580px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #eef2f6;
        }
        .header {
            background-color: #ea580c; /* Orange UmiqFood */
            padding: 32px 24px;
            text-align: center;
        }
        .header-logo {
            font-size: 38px;
            margin-bottom: 6px;
        }
        .header-title {
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 36px 32px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-top: 0;
            margin-bottom: 16px;
        }
        p {
            font-size: 15px;
            color: #4b5563;
            margin-bottom: 20px;
        }
        .btn-wrapper {
            text-align: center;
            margin: 32px 0;
        }
        .btn-verify {
            display: inline-block;
            background-color: #ea580c;
            color: #ffffff !important;
            padding: 14px 32px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 8px;
            box-shadow: 0 3px 6px rgba(234, 88, 12, 0.3);
        }
        .note-card {
            background-color: #fff7ed;
            border-left: 4px solid #ea580c;
            padding: 14px 18px;
            border-radius: 6px;
            margin-bottom: 24px;
        }
        .note-card p {
            margin: 0;
            font-size: 13.5px;
            color: #9a3412;
        }
        .divider {
            border-top: 1px solid #e5e7eb;
            margin: 28px 0;
        }
        .subcopy {
            font-size: 12.5px;
            color: #6b7280;
            word-break: break-all;
        }
        .footer {
            background-color: #fafbfc;
            border-top: 1px solid #f1f5f9;
            padding: 24px;
            text-align: center;
            font-size: 12.5px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-logo">🍱</div>
            <h1 class="header-title">UmiqFood</h1>
        </div>

        <!-- Body -->
        <div class="content">
            <h2 class="greeting">Halo, {{ $userName }}! 👋</h2>
            
            <p>
                Terima kasih telah mendaftar di <strong>UmiqFood</strong>. Untuk memastikan keamanan akun Anda dan mulai menikmati layanan pemesanan masakan kami, silakan konfirmasi alamat email Anda.
            </p>

            <div class="btn-wrapper">
                <a href="{{ $verificationUrl }}" class="btn-verify" target="_blank">
                    Verifikasi Alamat Email
                </a>
            </div>

            <div class="note-card">
                <p>
                    ⏱️ <strong>Batas Waktu:</strong> Tautan verifikasi ini berlaku selama <strong>60 menit</strong>. Jika sudah kadaluarsa, Anda dapat meminta tautan verifikasi baru melalui halaman login.
                </p>
            </div>

            <p style="font-size: 14px; color: #6b7280;">
                Jika Anda tidak merasa mendaftar akun di UmiqFood, abaikan email ini. Tidak ada tindakan lebih lanjut yang diperlukan.
            </p>

            <div class="divider"></div>

            <p class="subcopy">
                Jika Anda mengalami kendala saat mengklik tombol di atas, salin dan tempelkan tautan berikut ke peramban (browser) web Anda:<br>
                <a href="{{ $verificationUrl }}" style="color: #ea580c;">{{ $verificationUrl }}</a>
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            &copy; {{ date('Y') }} UmiqFood. Seluruh hak cipta dilindungi.<br>
            Jl. Raya UmiqFood No. 1 — Solusi Masakan Lezat & Praktis.
        </div>
    </div>
</body>
</html>

