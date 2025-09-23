import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Panggil fungsi sekali saat komponen pertama kali dimuat
    checkMobile(); 

    // Tambahkan event listener untuk merespons perubahan ukuran layar
    window.addEventListener('resize', checkMobile);
    
    // Hapus event listener saat komponen di-unmount
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []); // Array dependensi kosong memastikan efek hanya berjalan sekali

  return isMobile;
}
