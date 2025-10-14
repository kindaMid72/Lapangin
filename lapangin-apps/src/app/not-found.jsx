import Link from 'next/link';

export default function NotFound() {
    return (
        <div>
            <h1>this page is going no where</h1>
            <p>go back to root <Link href='/' className="underline">here</Link></p>
        </div>
    )
}