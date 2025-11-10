

export default function getDayName(date){
    const dayName = ['Minggu','Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu' ];
    const dayObject = new Date(date);
    return dayName[dayObject.getDay()];
}