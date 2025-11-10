export default function getDayIndex(date) {
    const [year, month, day] = String(date).split('-').map(Number);
    //console.log(year, month, day);
    const dayObject = new Date(year, month - 1, day);
    // console.log({dayObject}); // pass, object returned { dayObject: 2025-11-09T16:00:00.000Z }

    const rawIndex = dayObject.getDay(); // 0 = Sunday

    return rawIndex === 0 ? 6 : rawIndex - 1; // ubah agar Senin = 0
}