
export default function thousandNumberSeparator(number){ // 
    return number.toString()
            .replace(/\D/g, '')
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Tambah titik setiap 3 digit
}