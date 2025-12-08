const featuresList = [
    { icon: 'fa-calendar-check', title: 'Manajemen Booking', description: 'Atur dan lihat semua jadwal booking dalam satu kalender interaktif. Hindari double-booking dengan mudah.' },
    { icon: 'fa-layer-group', title: 'Manajemen Lapangan', description: 'Kelola beberapa lapangan atau court, atur harga berbeda untuk hari kerja dan akhir pekan.' },
    { icon: 'fa-people-group', title: 'Manajemen Tim', description: 'Undang staf dan berikan peran spesifik untuk membantu Anda mengelola operasional venue.' },
    { icon: 'fa-chart-simple', title: 'Laporan Pendapatan', description: 'Dapatkan wawasan mendalam tentang performa bisnis Anda dengan laporan pendapatan yang mudah dibaca.' },
    { icon: 'fa-credit-card', title: 'Konfirmasi Pembayaran', description: 'Verifikasi bukti pembayaran dari pelanggan dengan cepat dan ubah status booking secara real-time.' },
    { icon: 'fa-globe', title: 'Halaman Microsite', description: 'Setiap venue mendapatkan halaman microsite sendiri untuk memudahkan pelanggan melihat jadwal dan melakukan booking.' },
];

export default function Features() {
    return (
        <div className="max-w-5xl mx-auto py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold">Fitur Unggulan</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Semua yang Anda butuhkan untuk membawa manajemen venue ke level berikutnya.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuresList.map((feature, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-center size-12 bg-green-100 dark:bg-green-900/50 rounded-full mb-4">
                            <i className={`fa-solid ${feature.icon} text-xl text-green-600 dark:text-green-400`}></i>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}