import { Temporal } from '@js-temporal/polyfill';

// dapatkan Instant (waktu mutlak, tanpa zona)
const nowInstant = Temporal.Now.instant();

// Untuk menambahkan unit kalender seperti 'hari', kita perlu konteks zona waktu.
// 1. Ubah Instant ke ZonedDateTime (misalnya, dalam UTC).
const zonedDateTime = nowInstant.toZonedDateTimeISO('UTC');

// 2. Tambahkan 10 hari.
const laterZonedDateTime = zonedDateTime.add({ days: 10 });

// (Opsional) Jika Anda butuh hasilnya kembali sebagai Instant.
const laterInstant = laterZonedDateTime.toInstant();

// Tampilkan hasilnya
console.log("Waktu saat ini (Instant):", nowInstant.toString());
console.log("Waktu 10 hari dari sekarang (ZonedDateTime):", laterZonedDateTime.toString());
console.log("Waktu 10 hari dari sekarang (Instant):", laterInstant.toString());