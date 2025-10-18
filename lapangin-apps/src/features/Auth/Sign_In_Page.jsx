"use client"


export default ()=> {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 relative dark:bg-gray-800">
            <div className="flex flex-col justify-center items-center w-[450px] border-2 border-transparent rounded-xl py-6 px-8 font-mono [box-shadow:0px_0px_50px_#c7c7c7]">
                <div> {/* welcome back section */}
                    <h1 className="text-4xl font-extrabold">Welcome to Lapangin!</h1>
                    <p className="text-gray-600 mt-3 dark:text-white">Sign in to continue</p>
                </div>


                {/* or break line */}
                <div className="flex justify-center items-center mt-8 w-full">
                    <div className="h-0 w-5 border-y-1 border-gray-300 flex-1"></div>
                    {/* <p className="px-2 text-gray-400">or</p>
                    <div className="h-0 w-5 border-y-1 border-gray-300 flex-1"></div> */}
                </div>

                {/* email login section */}
                <form onSubmit={() => {  }} className="w-full flex flex-col mt-5">


                    <p>Email</p>
                    <input name="email" value={""} onChange={() => {  }} type='text' placeholder="your@example.com" className="w-full border-2 border-gray-300 p-2 rounded-md mb-2"></input>
                    <p>Password</p>
                    <input name="password" value={""} onChange={() => {  }} type='password' placeholder="Enter your password" className="w-full border-gray-300 border-2 p-2 rounded-md mb-2"></input>
                    <p>Confirm Password</p>
                    <input name="confirm_password" value={''} onChange={() => {  }} type='password' placeholder="Enter your password" className="w-full border-gray-300 border-2 p-2 rounded-md"></input>

                    {/* sign in button */}
                    <button type="submit" className="w-full border-2 border-transparent bg-blue-600 rounded-lg py-2 mt-5 text-white font-[800] hover:bg-blue-800 transition-color duration-150 ease-in-out">Sign in</button>
                </form>

            </div>
        </div>
    )
}