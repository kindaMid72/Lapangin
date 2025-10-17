"use client"
import Link from "next/link";


export default function Login_Page() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="flex flex-col justify-center items-center w-[450px] border-2 border-transparent rounded-xl py-6 px-8 font-mono [box-shadow:0px_0px_50px_#c7c7c7]">
                <div> {/* welcome back section */}
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Welcome back!</h1>
                    <p className="text-gray-600 mt-3 dark:text-white">Log in to your account to continue</p>
                </div>
                {/* email login section */}
                <form onSubmit={() => { }} className="w-full flex flex-col mt-5">
                    <p>Email</p>
                    <input type='text' value={''} onChange={() => { }} placeholder="your@example.com" className="w-full border-2 border-gray-300 p-2 rounded-md mb-2"></input>
                    <p>Password</p>
                    <input type='password' value={''} onChange={() => { }} placeholder="Enter your password" className="w-full border-gray-300 border-2 p-2 rounded-md"></input>

                    <div className="flex justify-between items-center mt-5"> {/* forgot password section */}
                        <div className="flex justify-start items-center">
                            <input type='checkbox' checked={false} onChange={() => { }} className="mr-2"></input> {/* remember for 30 day*/}
                            <p>Remember me</p>
                        </div>
                        <button className="hover:underline" onClick={() => { }}>Forgot Password?</button>
                    </div>

                    {/* login button */} {/* onClick auth */}
                    <button onClick={(e) => { }} type="submit" className="w-full border-2 border-transparent bg-blue-600 rounded-lg py-2 mt-5 text-white font-[800]">Log in</button>
                </form>

                {/* sign up section */}
                <div>
                    <p className="text-center mt-7 text-gray-500">Don't have an account? <Link href="/login" className="text-blue-600 hover:underline font-extrabold">Sign up for free</Link></p>
                </div>

            </div>
        </div>
    );
}