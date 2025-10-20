'use client'
// libs
import React, { useState } from "react";


// components
import InfoCard from "../components/InfoCard";
import BookingChart from "./BookingChart";
import BusyHourChart from "./BusyHourChart";
import CourtPerformaChart from "./CourtPerformaChart";
import EarningChart from "./EarningChart";


export default function ReportPage() {

    const [chartView, setChartView] = useState('EarningChart');

    return(<>
        {/* Report & Analitic */}
        <div className="flex justify-between p-4">
            <div>
                <h1 className="text-2xl font-extrabold">Laporan & Analitik</h1>
                <p className="text-md">Pantau performa bisnis Anda.</p>
            </div>
            <div className="flex gap-4 items-center h-fit">
                <select className="border-2 border-gray-500 rounded-xl px-4 py-2">
                    <option>7 Hari Terakhir</option>
                    <option>30 Hari Terakhir</option>
                    <option>90 Hari Terakhir</option>
                </select>
                <button className="bg-green-800 hover:bg-green-700  -transparent font-extrabold rounded-xl px-4 py-2"><i className="fa-solid fa-download"></i>Export</button>
            </div>
        </div>

        {/* info card */}
        <div className="flex gap-3 flex-wrap justify-evenly p-2 [&_i]:text-3xl [&_i]:pr-3">
            <InfoCard title={"Total Pendapatan"} value={"Rp 2.000.000"} icon={<i className="fa-solid fa-dollar-sign text-green-500"></i>} statisticValue={"4.5% dari bulan lalu"}/>
            <InfoCard title={"Total Booking"} value={"234"} icon={<i className="fa-solid fa-calendar-days text-yellow-500"></i>} statisticValue={"12% dari bulan lalu"}/>
            <InfoCard title={"Rata-rata Harian"} value={"9"} icon={<i className="fa-solid fa-chart-simple text-green-500"></i>} statisticValue={"Dalam 30 hari terakhir"}/>
            <InfoCard title={"Lapangan Terbaik"} value={"Lapangan 1"} icon={<i className="fa-regular fa-flag text-blue-500"></i>} statisticValue={"Rata-rata 79% terisi"}/>
        </div>

        {/* chart navbar */}
        <ol className="flex justify-evenly p-4">
            {/* ridirect base on routing */}
            <li onClick={() => {setChartView('EarningChart')}} className="border-1 border-gray-600 rounded-xl px-6 py-1 hover:bg-green-600 cursor-pointer hover:border-transparent  transition-colors duration-150 ease-in-out font-extrabold">Pendapatan</li>
            <li onClick={() => {setChartView('BookingChart')}} className="border-1 border-gray-600 rounded-xl px-6 py-1 hover:bg-green-600 cursor-pointer hover:border-transparent  transition-colors duration-150 ease-in-out font-extrabold">Booking</li>
            <li onClick={() => {setChartView('BusyHourChart')}} className="border-1 border-gray-600 rounded-xl px-6 py-1 hover:bg-green-600 cursor-pointer hover:border-transparent  transition-colors duration-150 ease-in-out font-extrabold">Performa</li>
        <li onClick={() => {setChartView('CourtPerformaChart')}} className="border-1 border-gray-600 rounded-xl px-6 py-1 hover:bg-green-600 cursor-pointer hover:border-transparent  transition-colors duration-150 ease-in-out font-extrabold">Jam Sibuk</li>
        </ol>
        {/* chart */}
        <div>
            {chartView === 'EarningChart' && <EarningChart/>}
            {chartView === 'BookingChart' && <BookingChart/>}
            {chartView === 'BusyHourChart' && <BusyHourChart/>}
            {chartView === 'CourtPerformaChart' && <CourtPerformaChart/>}
        </div>

    </>)
}