

export default function handleChangeTime(value){ // value is in time (hour, minutes) format
    const [hours, minutes] = value.split(':');
    const minutesNum = parseInt(minutes, 10);
    // Bulatkan menit ke 00 atau 30
    const newMinutes = minutesNum < 30 ? '00' : '30';
    return `${hours}:${newMinutes}`;
}