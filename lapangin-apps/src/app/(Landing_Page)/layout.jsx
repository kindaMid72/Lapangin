import Link from 'next/link'

export default function Landing_PageLayout({children}){
    return (
    <div>
        {/* pop up element goes here */}
        <header>
          <nav>
            <ul className="flex gap-2 bg-gray-500 [&_li]:p-2 [&_li]:cursor-pointer ">
              <li ><Link href="/">Home</Link></li>
              <li ><Link href='/About'>About</Link></li>
              <li ><Link href='/Features'>Features</Link></li>
              <li ><Link href='/login'>Login</Link></li>
              <li ><Link href='/sign_in'>Sign Up</Link></li>
            </ul>
          </nav>
        </header>
        {children}
        <footer>
          <div className="bg-gray-500 p-2 absolute bottom-0">
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus deserunt exercitationem unde suscipit aperiam eveniet adipisci neque delectus ex enim. Repellat aliquid optio tempora illum aspernatur. Dolorem quibusdam nostrum sequi!</p>
          </div>
        </footer>
    </div>
    )
}