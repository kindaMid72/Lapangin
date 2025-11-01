

export default function createSlug(string){
    return string
            .toLowerCase()             // standarisasi ke dalam lower case
            .replace(/[^\w\s-]/g, '')   // hapus karakter non-alfanumerik
            .trim()
            .replace(/\s+/g, '-')      // ganti spasi dengan -
            + `-${String(Date.now())}`

}