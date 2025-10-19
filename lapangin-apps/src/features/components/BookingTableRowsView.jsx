export default function BookingPageRow({Booking_Id,Lapangan,Customer,Waktu,Harga,Status,Aksi}) {
    return (
        <tr className=" [&_td]:border-b-1 dark:[&_td]:border-gray-700 [&_td]:border-gray-700 border-black w-fit">
            <td className="p-2">{Booking_Id || "null"}</td>
            <td className="p-2">{Lapangan || "lapangan x"}</td>
            <td className="p-2">{Customer || "Customers Name"}<br />{"+xxxxxxxxxx"}</td>
            <td className="p-2">{Waktu || "x xx:xx"}<br />{"22:30"}</td>
            <td className="p-2">{Harga || "Rp. xxx.xxx"}</td>
            <td className="p-2">
                <div className="flex items-center justify-center">
                    <p className="border-1 rounded-lg px-2 bg-green-400 text-black">{Status || "Undefined"}</p>
                </div>
            </td>
            <td className="p-2">
                <div className="flex items-center justify-center">
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                </div>                  
            </td>
        </tr>
    )
}