<x-mail::layout>
{{-- Header --}}
<x-slot:header>
<x-mail::header :url="config('app.url')">
🍱 UmiqFood
<span style="display:block;margin-top:4px;color:#059669;font-size:11px;font-weight:600;letter-spacing:0.02em;">
Pickup only · tanpa biaya antar
</span>
</x-mail::header>
</x-slot:header>

{{-- Body --}}
{!! $slot !!}

{{-- Subcopy --}}
@isset($subcopy)
<x-slot:subcopy>
<x-mail::subcopy>
{!! $subcopy !!}
</x-mail::subcopy>
</x-slot:subcopy>
@endisset

{{-- Footer --}}
<x-slot:footer>
<x-mail::footer>
© {{ date('Y') }} UmiqFood — masakan rumahan, diambil saat siap.<br>
Bayar cash atau QRIS · tanpa biaya antar
</x-mail::footer>
</x-slot:footer>
</x-mail::layout>
