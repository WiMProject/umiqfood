<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Struk {{ $order->kode }} - UmiqFood</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 24px;
            color: #1f2937;
            background: #f9fafb;
        }
        .struk {
            max-width: 420px;
            margin: 0 auto;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .center { text-align: center; }
        .brand { font-size: 20px; font-weight: 800; color: #059669; letter-spacing: -0.02em; }
        .sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
        .divider { border-top: 1px dashed #d1d5db; margin: 14px 0; }
        .row { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; margin: 4px 0; }
        .row .label { color: #6b7280; }
        .row .value { font-weight: 600; text-align: right; }
        .item { padding: 6px 0; border-bottom: 1px dotted #e5e7eb; }
        .item:last-child { border-bottom: none; }
        .item-name { font-size: 13px; font-weight: 600; }
        .item-meta { font-size: 11px; color: #6b7280; margin-top: 2px; display: flex; justify-content: space-between; }
        .total { font-size: 16px; font-weight: 800; color: #059669; }
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
            background: #ecfdf5;
            color: #047857;
        }
        .footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: 16px; }
        .actions { text-align: center; margin-top: 20px; }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            background: #059669;
            color: #fff;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
        }
        .btn:hover { background: #047857; }
        @media print {
            body { background: #fff; padding: 0; }
            .struk { box-shadow: none; border: none; max-width: 100%; }
            .actions { display: none; }
        }
    </style>
</head>
<body>
    <div class="struk">
        <div class="center">
            <div class="brand">UmiqFood</div>
            <div class="sub">Masakan rumahan · Pickup only</div>
        </div>

        <div class="divider"></div>

        <div class="row">
            <span class="label">Kode pesanan</span>
            <span class="value">{{ $order->kode }}</span>
        </div>
        <div class="row">
            <span class="label">Tanggal</span>
            <span class="value">{{ $order->tanggal?->format('d M Y') }} {{ $order->created_at?->format('H:i') }}</span>
        </div>
        <div class="row">
            <span class="label">No. antrian</span>
            <span class="value">{{ $order->antrian_format }}</span>
        </div>
        <div class="row">
            <span class="label">Status</span>
            <span class="value"><span class="badge">{{ $order->status_label }}</span></span>
        </div>
        <div class="row">
            <span class="label">Metode bayar</span>
            <span class="value">{{ $order->metode_pembayaran_label }}</span>
        </div>

        <div class="divider"></div>

        <div class="row">
            <span class="label">Pengambil</span>
            <span class="value">{{ $order->nama_pengambil }}</span>
        </div>
        <div class="row">
            <span class="label">No. HP</span>
            <span class="value">{{ $order->no_hp }}</span>
        </div>
        @if($order->catatan)
            <div class="row">
                <span class="label">Catatan</span>
                <span class="value">{{ $order->catatan }}</span>
            </div>
        @endif

        <div class="divider"></div>

        <div style="font-size:12px; font-weight:700; color:#374151; margin-bottom:6px;">Detail pesanan</div>
        @foreach($order->items as $item)
            <div class="item">
                <div class="item-name">{{ $item->nama_menu }}</div>
                <div class="item-meta">
                    <span>{{ $item->jumlah }} × Rp {{ number_format($item->harga_satuan, 0, ',', '.') }}</span>
                    <span>Rp {{ number_format($item->subtotal, 0, ',', '.') }}</span>
                </div>
            </div>
        @endforeach

        <div class="divider"></div>

        <div class="row">
            <span class="label">Subtotal</span>
            <span class="value">Rp {{ number_format($order->subtotal, 0, ',', '.') }}</span>
        </div>
        @if(($order->diskon ?? 0) > 0)
            <div class="row">
                <span class="label">Diskon{{ $order->kode_kupon ? " ({$order->kode_kupon})" : '' }}</span>
                <span class="value">- Rp {{ number_format($order->diskon, 0, ',', '.') }}</span>
            </div>
        @endif
        <div class="row">
            <span class="label total">Total</span>
            <span class="value total">Rp {{ number_format($order->total, 0, ',', '.') }}</span>
        </div>

        @if($order->payment)
            <div class="row" style="margin-top:6px;">
                <span class="label">Pembayaran</span>
                <span class="value">{{ $order->payment->status_label ?? $order->payment->status }}</span>
            </div>
        @endif

        <div class="divider"></div>

        <div class="footer">
            <p>Terima kasih sudah memesan di UmiqFood.</p>
            <p>Ambil pesanan di outlet sesuai jam buka. Simpan struk ini sebagai bukti.</p>
        </div>

        <div class="actions">
            <button class="btn" onclick="window.print()">Cetak struk</button>
        </div>
    </div>
</body>
</html>
