import Link from "next/link";

export default function Home({children}){


    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono">
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md">
                <nav className="container mx-auto flex items-center justify-between p-4">
                    <Link href="/" className="text-2xl font-extrabold text-green-600">
                        Lapangin
                    </Link>
                    <ul className="hidden md:flex items-center gap-6">
                        <li><Link href="/" className="hover:text-green-500 transition-colors">Home</Link></li>
                        <li><Link href='/About' className="hover:text-green-500 transition-colors">About</Link></li>
                        <li><Link href='/Features' className="hover:text-green-500 transition-colors">Features</Link></li>
                    </ul>
                    <div className="flex items-center gap-3">
                        <Link href='/login' className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            Login
                        </Link>
                        <Link href='/sign_in' className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold">
                            Sign Up
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="flex-grow container mx-auto p-4 md:p-8">
                {children}
            </main>

            <footer className="bg-gray-100 dark:bg-gray-800 mt-12">
                <div className="container mx-auto p-6 text-center text-gray-500 dark:text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Lapangin. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}