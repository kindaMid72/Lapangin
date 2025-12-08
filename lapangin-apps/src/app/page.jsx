
import Link from "next/link";

export default function Home() {
  return (
    <section className="text-center flex flex-col items-center justify-center py-16 md:py-24">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Kelola <span className="text-green-500">CourtSpace</span> Anda,
          <br />
          Tanpa Ribet.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-400">
          Lapangin adalah platform all-in-one untuk manajemen venue olahraga. Dari penjadwalan booking, manajemen tim, hingga laporan pendapatan, semua ada di satu tempat.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/sign_in" className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg text-lg hover:bg-green-700 transition-transform hover:scale-105">
            Mulai Sekarang
          </Link>
          <Link href="/Features" className="px-8 py-4 bg-gray-200 dark:bg-gray-700 font-bold rounded-lg text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-transform hover:scale-105">
            Lihat Fitur
          </Link>
        </div>
      </div>

    </section>
  );
}
