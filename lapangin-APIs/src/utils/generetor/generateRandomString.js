
// given length, return unique string

import crypto from 'crypto';

export default function generateUniqueString(length) {
  // Buat UUID (praktis unik secara global)
  const uuid = crypto.randomUUID().replace(/-/g, '') // hapus tanda '-'

  // Jika panjang lebih pendek dari UUID, potong
  if (length <= uuid.length) {
    return uuid.slice(0, length)
  }

  // Jika panjang lebih panjang dari UUID, gabungkan dengan timestamp
  const timestamp = Date.now().toString(36) // konversi waktu ke base36
  const combined = uuid + timestamp

  // Potong sesuai panjang yang diminta
  return combined.slice(0, length)
}
