"use client";

import { useEffect, useState } from 'react';
import { useLiveAuction } from '../hooks/useLiveAuction';
import { Clock, TrendingDown, Info, ShieldCheck } from 'lucide-react';

export type AuctionStatus = 'LIVE' | 'FOMO_HOT' | 'FOMO_CRITICAL';

export interface Auction {
  id: string;
  title: string;
  current_price: number;
  floor_price: number;
  status: AuctionStatus;
}

interface AuctionCardProps {
  initialAuction: Auction;
}

export function AuctionCard({ initialAuction }: AuctionCardProps) {
  const liveAuctionData = useLiveAuction(initialAuction.id);
  const auction = liveAuctionData || initialAuction;

  const [timeLeft, setTimeLeft] = useState(59);

  // Vibration for FOMO_CRITICAL
  useEffect(() => {
    if (auction.status === 'FOMO_CRITICAL' && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }
  }, [auction.status, auction.current_price]);

  // Mock Countdown for FOMO_CRITICAL
  useEffect(() => {
    if (auction.status !== 'FOMO_CRITICAL') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [auction.status]);

  const isLive = auction.status === 'LIVE';
  const isHot = auction.status === 'FOMO_HOT';
  const isCritical = auction.status === 'FOMO_CRITICAL';

  // Dynamic Styles
  const containerClasses = [
    "relative w-full max-w-sm rounded-2xl overflow-hidden bg-[#121212] transition-all duration-500 ease-out",
    isLive ? "border border-neutral-800" : "",
    isHot ? "border border-transparent" : "",
    isCritical ? "border border-transparent" : ""
  ].filter(Boolean).join(" ");

  const wrapperClasses = [
    "p-[1px] rounded-2xl",
    isHot ? "bg-gradient-to-br from-amber-500 via-yellow-500 to-yellow-600 animate-pulse" : "",
    isCritical ? "bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)]" : ""
  ].filter(Boolean).join(" ");

  const buttonClasses = [
    "w-full py-4 rounded-xl font-black tracking-widest text-sm uppercase transition-all duration-300 flex items-center justify-center gap-2",
    isLive ? "bg-[#0a0a0a] border border-[#bf953f]/40 text-[#bf953f] hover:bg-[#bf953f]/10" : "",
    isHot ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-yellow-500/20" : "",
    isCritical ? "bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] scale-105" : ""
  ].filter(Boolean).join(" ");

  return (
    <div className={wrapperClasses}>
      <div className={containerClasses}>
        {/* Content Container */}
        <div className="p-6 flex flex-col gap-6">
          
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-white font-sans font-bold text-lg tracking-wide">{auction.title}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-500 animate-ping' : isHot ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                <span className={`text-[10px] font-mono tracking-widest ${isCritical ? 'text-red-500' : isHot ? 'text-yellow-500' : 'text-emerald-500'}`}>
                  {auction.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <button className="text-neutral-500 hover:text-white transition-colors" title="Verified Asset">
              <ShieldCheck size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Pricing & Status */}
          <div className="flex flex-col gap-1 items-center justify-center py-4 bg-black/50 rounded-xl border border-white/5 relative overflow-hidden">
            <p className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase">Current Price</p>
            <div className="flex items-center gap-2">
              <TrendingDown size={20} className={isCritical ? "text-red-500 animate-bounce" : "text-[#bf953f]"} />
              <span className={`text-4xl font-black tracking-tight font-sans ${isCritical ? 'text-white' : 'bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] bg-clip-text text-transparent'}`}>
                ${auction.current_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            {/* Critical Phase Overlay */}
            {isCritical && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-red-600 to-amber-500 animate-pulse"></div>
            )}
          </div>

          {/* Floor Price Info */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 px-2">
            <div className="flex items-center gap-1.5 cursor-help" title="The lowest possible price before auction ends.">
              <Info size={12} />
              <span>Floor: ${auction.floor_price.toLocaleString('en-US')}</span>
            </div>
            {isCritical && (
              <div className="flex items-center gap-1.5 text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded">
                <Clock size={12} className="animate-spin-slow" />
                <span>00:{timeLeft.toString().padStart(2, '0')}</span>
              </div>
            )}
          </div>

          {/* Action Area */}
          <button className={buttonClasses} onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
            console.log('Buy Triggered', auction.id);
          }}>
            {isCritical ? 'BUY NOW (CRITICAL)' : 'BUY NOW'}
          </button>
          
        </div>
      </div>
    </div>
  );
}
