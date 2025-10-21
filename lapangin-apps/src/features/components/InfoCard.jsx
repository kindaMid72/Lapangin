

export default function InfoCard ({title, value, statisticValue, icon}) {

    return (<>
        <div className="flex items-stretch py-4 pl-4 pr-0 min-w-[250px] dark:bg-gray-900 bg-white border-2 rounded-lg border-transparent border-transpare dark:[box-shadow:0px_0px_20px_#ffffff">
            <div className="mr-3 flex-1 flex flex-col ">
                <h3 className=" font-extrabold mb-3 text-sm">{title || "Title"}</h3>
                <div className="">
                    <p className="text-2xl font-extrabold">{value || ""}</p>
                    <p className="text-sm">{statisticValue || ""}</p>
                </div>
            </div>
            <div className="[&>i]:text-[3em] [&>i]:mr-3 ">
                {icon}
            </div>
        </div>
    </>)
}