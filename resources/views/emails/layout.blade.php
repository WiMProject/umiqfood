<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>{{ $title ?? 'UmiqFood' }}</title>
    <style>
        body,
        body * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            background-color: #f0fdf4;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            line-height: 1.6;
            -webkit-text-size-adjust: 100%;
        }

        a {
            color: #047857;
        }

        .wrapper {
            background-color: #f0fdf4;
            padding: 32px 12px;
        }

        .card {
            background-color: #ffffff;
            border: 1px solid #d1fae5;
            border-radius: 20px;
            box-shadow: 0 18px 40px -24px rgba(4, 120, 87, 0.45);
            overflow: hidden;
        }

        .hero {
            background-color: #059669;
            background-image: linear-gradient(135deg, #059669 0%, #047857 52%, #0f766e 100%);
            padding: 32px 28px;
            text-align: center;
        }

        .brand {
            color: #ffffff;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.4px;
        }

        .brand-icon {
            font-size: 30px;
            vertical-align: middle;
        }

        .badge {
            display: inline-block;
            margin-top: 12px;
            padding: 5px 12px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 999px;
            background-color: rgba(255, 255, 255, 0.12);
            color: #d1fae5;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.02em;
        }

        .hero-title {
            margin: 18px 0 6px;
            color: #ffffff;
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.6px;
            line-height: 1.2;
        }

        .hero-subtitle {
            margin: 0;
            color: #d1fae5;
            font-size: 14px;
        }

        .content {
            padding: 36px 32px 28px;
        }

        .greeting {
            margin: 0 0 16px;
            color: #064e3b;
            font-size: 18px;
            font-weight: 700;
        }

        .text {
            margin: 0 0 18px;
            color: #4b5563;
            font-size: 15px;
        }

        .muted {
            color: #6b7280;
            font-size: 13px;
        }

        .button-wrap {
            margin: 28px 0;
            text-align: center;
        }

        .button {
            display: inline-block;
            padding: 14px 30px;
            border-radius: 12px;
            background-color: #059669;
            box-shadow: 0 10px 20px -10px rgba(5, 150, 105, 0.75);
            color: #ffffff !important;
            font-size: 15px;
            font-weight: 700;
            text-decoration: none;
        }

        .note {
            margin: 0 0 24px;
            padding: 14px 18px;
            border-left: 4px solid #10b981;
            border-radius: 10px;
            background-color: #ecfdf5;
            color: #065f46;
            font-size: 13px;
        }

        .note strong {
            color: #047857;
        }

        .divider {
            height: 1px;
            margin: 26px 0 22px;
            background-color: #e5e7eb;
        }

        .fallback {
            margin: 0;
            color: #6b7280;
            font-size: 12px;
            line-height: 1.7;
            word-break: break-all;
        }

        .footer {
            padding: 22px 24px;
            border-top: 1px solid #d1fae5;
            background-color: #f7fefb;
            color: #6b7280;
            font-size: 12px;
            text-align: center;
        }

        .footer-links {
            margin-top: 8px;
            color: #059669;
            font-weight: 600;
        }

        @media only screen and (max-width: 600px) {
            .wrapper {
                padding: 16px 10px;
            }

            .hero {
                padding: 28px 20px;
            }

            .hero-title {
                font-size: 23px;
            }

            .content {
                padding: 28px 22px 24px;
            }

            .button,
            .button-wrap,
            .button-wrap a {
                display: block !important;
                width: 100% !important;
            }
        }

        @media (prefers-color-scheme: dark) {
            body,
            .wrapper {
                background-color: #07130f !important;
            }

            .card {
                background-color: #0f1f1a !important;
                border-color: #1f3b31 !important;
            }

            .greeting {
                color: #a7f3d0 !important;
            }

            .text,
            .muted,
            .fallback,
            .footer {
                color: #cbd5e1 !important;
            }

            .note {
                background-color: #052e24 !important;
                color: #a7f3d0 !important;
            }

            .note strong,
            .footer-links {
                color: #6ee7b7 !important;
            }

            .divider {
                background-color: #1f3b31 !important;
            }

            .footer {
                background-color: #0b1f19 !important;
                border-top-color: #1f3b31 !important;
            }
        }
    </style>
</head>
<body>
    <table class="wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;padding:32px 12px;">
        <tr>
            <td align="center">
                <table class="card" role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border:1px solid #d1fae5;border-radius:20px;">
                    <tr>
                        <td class="hero" style="background-color:#059669;background-image:linear-gradient(135deg,#059669 0%,#047857 52%,#0f766e 100%);padding:32px 28px;text-align:center;">
                            <div class="brand" style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.4px;">
                                <span class="brand-icon" style="font-size:30px;vertical-align:middle;">🍱</span>
                                Umiq<span style="color:#a7f3d0;">Food</span>
                            </div>
                            <span class="badge" style="display:inline-block;margin-top:12px;padding:5px 12px;border:1px solid rgba(255,255,255,0.3);border-radius:999px;background-color:rgba(255,255,255,0.12);color:#d1fae5;font-size:11px;font-weight:600;">
                                Pickup only · tanpa biaya antar
                            </span>
                            <h1 class="hero-title" style="margin:18px 0 6px;color:#ffffff;font-size:26px;font-weight:800;line-height:1.2;">
                                @yield('hero_title', 'Halo dari UmiqFood')
                            </h1>
                            <p class="hero-subtitle" style="margin:0;color:#d1fae5;font-size:14px;">
                                @yield('hero_subtitle', 'Masakan rumahan, diambil saat siap.')
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td class="content" style="padding:36px 32px 28px;">
                            @yield('content')
                        </td>
                    </tr>
                    <tr>
                        <td class="footer" style="padding:22px 24px;border-top:1px solid #d1fae5;background-color:#f7fefb;color:#6b7280;font-size:12px;text-align:center;">
                            © {{ date('Y') }} UmiqFood — masakan rumahan, diambil saat siap.<br>
                            <span class="footer-links" style="color:#059669;font-weight:600;">Bayar cash atau QRIS · tanpa biaya antar</span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
