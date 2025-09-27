'use client'
import { Search, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Hero() {
  return (
    <>
      {/* Force Mobile View CSS */}
      <style jsx global>{`
        .hero-container {
          width: 100%;
        }
        
        @media (min-width: 768px) {
          .hero-container {
            max-width: 375px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>

      <div className="hero-container">
        <div className="relative bg-gradient-to-br from-amber-400 to-amber-600 overflow-hidden">
          {/* Simple Background Pattern */}
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-200/20 rounded-full blur-2xl" />
          
          <div className="relative px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                Selamat Datang di
              </h1>
              <h2 className="text-3xl font-black text-white mb-3">
                Restoku
              </h2>
              <p className="text-white/90 text-sm max-w-xs mx-auto leading-relaxed">
                Nikmati hidangan lezat langsung dari dapur kami ke meja Anda
              </p>
            </div>
            {/* CTA Button */}
            {/* <div className="text-center mb-8">
              <Button className="bg-white text-amber-600 hover:bg-amber-50 font-semibold px-8 py-3 rounded-xl shadow-lg">
                Lihat Menu
              </Button>
            </div> */}

            {/* Food Illustration */}
            <div className="relative">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mx-4">
                <div className="aspect-square bg-white/30 rounded-xl flex items-center justify-center">
                  <div className="bg-white rounded-full p-4 shadow-lg">
                    <Utensils className="h-12 w-12 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}