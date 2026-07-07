import React, { useState, useRef } from 'react';
import { supabase } from './lib/supabaseClient';

import { AuctionCard, Auction } from './components/AuctionCard';

type ModalType = 'none' | 'impressum' | 'datenschutz';

export default function App() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vipId, setVipId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const counterRef = useRef<HTMLSpanElement>(null);

  const [demoAuction, setDemoAuction] = useState<Auction>({
    id: 'demo-1',
    title: 'ROLEX DAYTONA PLATINUM',
    current_price: 125000,
    floor_price: 90000,
    status: 'LIVE'
  });

  const cycleStatus = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
    setDemoAuction(prev => ({
      ...prev,
      status: prev.status === 'LIVE' ? 'FOMO_HOT' : prev.status === 'FOMO_HOT' ? 'FOMO_CRITICAL' : 'LIVE'
    }));
  };

  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const animateSlotMachine = (targetId: number) => {
    let current = 0;
    const duration = 1200;
    const steps = 30;
    const stepTime = duration / steps;
    
    triggerHaptic([30, 50, 30]);

    const interval = setInterval(() => {
      current += Math.ceil(targetId / steps);
      if (current >= targetId) {
        current = targetId;
        clearInterval(interval);
        triggerHaptic(40);
      }
      
      if (counterRef.current) {
        counterRef.current.textContent = `#${String(current).padStart(4, '0')}`;
      }
    }, stepTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    triggerHaptic(15);

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{ email }])
        .select('id')
        .single();

      if (error) {
        if (error.code === '23505') {
          alert('Diese E-Mail-Adresse ist bereits registriert.');
        } else {
          throw error;
        }
      } else if (data) {
        setVipId(String(data.id).padStart(4, '0'));
        setTimeout(() => animateSlotMachine(data.id), 100);
      }
    } catch (err) {
      console.error(err);
      alert('System ausgelastet. Bitte später erneut versuchen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between items-center p-6 font-sans antialiased selection:bg-[#bf953f] selection:text-black">
      
      {/* Spacer oben */}
      <div className="h-4"></div>

      {/* CENTER: Container (Exakt wie Design 2) */}
      <main className="w-full max-w-sm flex flex-col items-center text-center px-4">
        
        {/* Haupt-Header */}
        <h1 className="text-3xl font-black tracking-[0.25em] bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] bg-clip-text text-transparent uppercase font-sans">
          Hyperdealz
        </h1>
        
        {/* Sub-Header */}
        <p className="text-[10px] text-emerald-500 font-mono tracking-widest uppercase mt-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          System Aktiv / Pre-Launch
        </p>

        <div className="w-full mt-12 mb-4">
          <p className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase mb-3">
            Zugangskapazität limitiert.
          </p>

          {!vipId ? (
            /* FORMULAR */
            <form onSubmit={handleSubmit} className="relative w-full flex items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => triggerHaptic(10)}
                placeholder="mail@domain.tld"
                className="w-full bg-[#0c0c0c] border border-neutral-900 focus:border-[#bf953f]/50 rounded-xl pl-4 pr-12 py-3.5 text-sm text-neutral-200 placeholder-neutral-700 focus:outline-none transition-all duration-300 font-mono"
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="absolute right-3 text-neutral-500 hover:text-[#bf953f] transition-colors p-1 font-mono text-lg"
              >
                {isSubmitting ? '...' : '›'}
              </button>
            </form>
          ) : (
            /* SUCCESS STATE */
            <div className="w-full bg-[#0c0c0c] border border-neutral-900 rounded-xl p-6 font-mono space-y-3">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Dein System-Status</p>
              <span ref={counterRef} className="block text-3xl font-bold text-white tracking-wider">#0000</span>
              <p className="text-[9px] text-neutral-600 lowercase leading-relaxed">
                Token gesichert für {email}
              </p>
            </div>
          )}
        </div>

        {/* DEMO AUCTION CARD */}
        <div className="w-full mt-10 mb-8 flex flex-col items-center gap-4">
          <AuctionCard initialAuction={demoAuction} />
          <button onClick={cycleStatus} className="text-[9px] text-neutral-500 bg-neutral-900 px-3 py-1.5 rounded-md uppercase tracking-widest hover:text-[#bf953f] transition-colors border border-neutral-800">
            [ Dev: Toggle Status ]
          </button>
        </div>

      </main>

      {/* FOOTER: Unten fixiert */}
      <footer className="flex justify-center space-x-6 text-[10px] font-mono uppercase tracking-wider text-neutral-600 mb-4">
        <button onClick={() => { triggerHaptic(10); setActiveModal('impressum'); }} className="hover:text-[#bf953f] transition-colors">
          Impressum
        </button>
        <button onClick={() => { triggerHaptic(10); setActiveModal('datenschutz'); }} className="hover:text-[#bf953f] transition-colors">
          Datenschutz
        </button>
      </footer>

      {/* MODALS */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0c0c0c] border border-neutral-900 w-full max-w-xs rounded-xl p-6 font-mono text-[10px] text-neutral-400 space-y-4">
            {activeModal === 'impressum' ? (
              <>
                <h3 className="text-white font-bold uppercase tracking-wider">Impressum</h3>
                <p>[Dein Name]<br />[Deine Adresse]</p>
              </>
            ) : (
              <>
                <h3 className="text-white font-bold uppercase tracking-wider">Datenschutz</h3>
                <p>E-Mail-Erhebung erfolgt temporär und verschlüsselt via Supabase PostgreSQL RLS.</p>
              </>
            )}
            <button
              onClick={() => { triggerHaptic(10); setActiveModal('none'); }}
              className="w-full mt-4 bg-neutral-900 border border-neutral-800 text-neutral-300 uppercase py-2 rounded-lg text-[9px]"
            >
              [ Schließen ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}