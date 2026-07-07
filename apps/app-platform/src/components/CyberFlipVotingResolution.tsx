import { useState } from 'react';
import { Crown, Cpu } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
}

interface CyberFlipVotingResolutionProps {
  productA: Product;
  productB: Product;
  winner_product_id: string;
}

export function CyberFlipVotingResolution({ productA, productB, winner_product_id }: CyberFlipVotingResolutionProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [hasFlipped, setHasFlipped] = useState(false);

  const startFlip = () => {
    if (isFlipping || hasFlipped) return;
    setIsFlipping(true);
    setHasFlipped(true);
    setShowResult(false);
    
    // Pre-spin feedback
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([20, 30, 20]);
    }

    const isWinnerA = winner_product_id === productA.id;
    // 5 full spins (1800deg) + possible 180deg for the back side
    const targetRotation = rotation + 1800 + (isWinnerA ? 0 : 180);

    setRotation(targetRotation);

    // Resolution after 3 seconds
    setTimeout(() => {
      setIsFlipping(false);
      setShowResult(true);
      if (typeof window !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(150); // Impact
      }
    }, 3000);
  };

  const winnerProduct = winner_product_id === productA.id ? productA : productB;

  return (
    <div className="w-full flex flex-col items-center justify-center py-12 px-4 bg-[#000000] rounded-2xl border border-neutral-900/50 shadow-2xl relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#121212] to-black opacity-80 z-0"></div>
      
      {/* Title */}
      <div className="z-10 text-center mb-10">
        <h2 className="text-[10px] text-emerald-500 font-mono tracking-[0.3em] uppercase mb-2 animate-pulse">
          Tie-Break Resolution
        </h2>
        <p className="text-sm font-bold text-neutral-400 tracking-wider">
          {productA.name} <span className="text-neutral-600 mx-2">vs</span> {productB.name}
        </p>
      </div>

      {/* 3D Coin Scene */}
      <div className="z-10 relative" style={{ perspective: '1200px' }}>
        <div 
          className="relative w-48 h-48 cursor-pointer"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotation}deg)`,
            transition: 'transform 3s cubic-bezier(0.15, 0.85, 0.25, 1)',
          }}
          onClick={startFlip}
        >
          {/* FRONT (Product A - Luxury Gold) */}
          <div 
            className="absolute inset-0 rounded-full border-[3px] border-[#bf953f] bg-gradient-to-br from-[#2a2211] to-[#121212] shadow-[0_0_40px_rgba(191,149,63,0.3)] flex flex-col items-center justify-center p-4"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <Crown className="w-12 h-12 text-[#bf953f] mb-3 opacity-90" />
            <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] to-[#fcf6ba] text-center leading-tight uppercase tracking-widest">
              {productA.name}
            </span>
          </div>

          {/* BACK (Product B - Dark Cyber) */}
          <div 
            className="absolute inset-0 rounded-full border-[3px] border-emerald-500/80 bg-gradient-to-br from-[#0a1f16] to-[#050a08] shadow-[0_0_40px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center p-4"
            style={{ 
              backfaceVisibility: 'hidden', 
              transform: 'rotateY(180deg)' 
            }}
          >
            <Cpu className="w-12 h-12 text-emerald-500 mb-3 opacity-90" />
            <span className="text-xs font-bold text-emerald-400 text-center leading-tight uppercase tracking-widest">
              {productB.name}
            </span>
          </div>
        </div>
      </div>

      {/* Helper Text before flip */}
      {!hasFlipped && (
        <p className="z-10 mt-12 text-[9px] text-neutral-500 font-mono tracking-widest uppercase animate-bounce">
          Tap to execute flip
        </p>
      )}

      {/* Result Announcement */}
      <div className={`z-10 mt-8 transition-all duration-700 ease-out flex flex-col items-center ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <p className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase mb-1">
          Winner Selected
        </p>
        <p className="text-lg font-black tracking-widest text-white uppercase text-center">
          {winnerProduct.name}
        </p>
        <p className="text-[10px] text-[#bf953f] font-mono mt-3 uppercase tracking-widest">
          Loading next live auction...
        </p>
      </div>

    </div>
  );
}
