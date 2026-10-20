import { useEffect, useState } from 'react'

// Jam "sekarang" yang diperbarui berkala. Dipakai untuk membandingkan tenggat
// tugas tanpa memanggil Date.now() langsung di dalam render, sehingga komponen
// tetap murni dan penanda "melewati tenggat" ikut segar tanpa reload.
export function useNow(intervalMs = 60000) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])

  return now
}

export default useNow
