

export default function InfoCard ({title, value, statisticValue, icon}) {

    return (<>
        <div className="flex items-stretch py-4 pl-4 pr-0 min-w-[250px] dark:bg-gray-900 bg-white border-2 rounded-lg border-transparent border-transpare dark:[box-shadow:0px_0px_20px_#ffffff">
            <div className="mr-3 flex-1 flex flex-col ">
                <h3 className=" font-extrabold mb-3 text-sm">{title || "Title"}</h3>
                <div className="">
                    <p className="text-2xl font-extrabold">{value || "12"}</p>
                    <p className="text-sm">{statisticValue || "12% dari minggu lalu"}</p>
                </div>
            </div>
            <div className="">
                {icon}
            </div>
        </div>
    </>)
}