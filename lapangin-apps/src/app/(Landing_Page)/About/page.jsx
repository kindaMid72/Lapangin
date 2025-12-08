export const metadata = {
    title: "About"
}

export default function About() {
    return (
        <div className="max-w-4xl mx-auto py-12">
            <h1 className="text-4xl font-extrabold text-center mb-8">Tentang Lapangin</h1>
            <div className="space-y-6 text-gray-600 dark:text-gray-400 text-lg">
                <p>Lapangin lahir dari kebutuhan untuk menyederhanakan kompleksitas manajemen venue olahraga. Kami melihat para pemilik dan manajer venue menghabiskan terlalu banyak waktu untuk tugas administratif yang berulang, seperti mencatat booking secara manual, mengatur jadwal staf, dan merekap pendapatan.</p>
                <p>Misi kami adalah menyediakan sebuah platform yang intuitif, kuat, dan terintegrasi yang memungkinkan Anda untuk fokus pada hal yang paling penting: memberikan pengalaman terbaik bagi pelanggan Anda dan mengembangkan bisnis Anda.</p>
                <p>Dengan Lapangin, kami percaya bahwa setiap pemilik CourtSpace, besar maupun kecil, dapat mengelola operasional mereka dengan efisiensi sekelas profesional.</p>
            </div>
        </div>
    );
}