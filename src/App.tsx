import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase-Client initialisieren
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type ModalType = 'none' | 'impressum' | 'datenschutz';

export default function App() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vipId, setVipId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  
  // Ref für den Slot-Machine-Zähler zur render-freien Mutation
  const counterRef = useRef<HTMLSpanElement>(null);

  // Haptische Kapselung mit Feature-Detection
  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.warn('Haptic feedback not supported by device configuration', e);
      }
    }
  };

  // Performance-optimierte Slot-Machine-Animation über native DOM-Mutation
  const animateSlotMachine = (targetId: number) => {
    let current = 0;
    const duration = 1200; // ms
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
      console.error('Lead insertion failed:', err);
      alert('System ausgelastet. Bitte später erneut versuchen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] text-white flex flex-col justify-between items-center px-6 selection:bg-[#BF953F]/30">
      
      {/* 1. Top: Status Indikator */}
      <header className="h-[20vh] flex items-center justify-center">
        <div className="flex items-center gap-2 tracking-widest text-[10px] text-zinc-500 uppercase">
          <span className="w-1.5 h-1.5 bg-[#BF953F] rounded-full animate-pulse" />
          Pre-Launch Access
        </div>
      </header>

      {/* 2. Center: Interaktionszone */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-[400px] text-center gap-8">
        
        {/* Logo mit simuliertem Gold-Gradient */}
        <h1 className="text-3xl font-bold tracking-wider uppercase bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent">
          Hyperdealz.de
        </h1>

        {!vipId ? (
          <>
            {/* Minimale Micro-Copy */}
            <p className="text-xs tracking-wide text-zinc-400 uppercase">
              Zugangskapazität limitiert.
            </p>

            {/* Kompaktes, zentriertes Eingabefeld */}
            <form onSubmit={handleSubmit} className="w-full flex items-center border border-zinc-900 focus-within:border-[#BF953F] rounded-sm transition-all duration-300 bg-transparent max-w-[340px]">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => triggerHaptic(10)}
                placeholder="mail@domain.tld" 
                className="w-full bg-transparent px-4 py-3 text-xs tracking-wider text-white placeholder-zinc-700 outline-none appearance-none"
                style={{
                  // Verhindert den hässlichen weißen Hintergrund bei Browser-Autofill
                  WebkitBoxShadow: '0 0 0 30px #000000 inset',
                  WebkitTextFillColor: '#FFFFFF',
                }}
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="pr-4 pl-2 text-zinc-500 hover:text-[#FCF6BA] transition-colors text-sm font-light disabled:opacity-50"
              >
                {isSubmitting ? '...' : '›'}
              </button>
            </form>
          </>
        ) : (
          /* SUCCESS-STATE (Slot Machine) */
          <div className="w-full flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-10 h-10 bg-zinc-950 border border-[#BF953F]/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(191,149,63,0.1)]">
              <span className="text-[#BF953F] text-sm">✓</span>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">System-Status</h2>
              {/* Direkte DOM-Mutation */}
              <span 
                ref={counterRef} 
                className="block text-3xl font-extrabold font-mono tracking-wider text-white tabular-nums"
              >
                #0000
              </span>
            </div>

            <p className="text-[11px] tracking-wide text-zinc-400 max-w-[280px] leading-relaxed">
              Zugangstoken reserviert. Code-Zustellung erfolgt an <span className="text-white font-mono">{email}</span>.
            </p>
          </div>
        )}
      </main>

      {/* 3. Bottom: Rechtssicherer Footer */}
      <footer className="h-[10vh] flex items-center justify-center gap-6 opacity-20 hover:opacity-100 transition-opacity duration-300">
        <button onClick={() => { triggerHaptic(10); setActiveModal('impressum'); }} className="text-[10px] tracking-widest uppercase hover:text-[#BF953F]">Impressum</button>
        <button onClick={() => { triggerHaptic(10); setActiveModal('datenschutz'); }} className="text-[10px] tracking-widest uppercase hover:text-[#BF953F]">Datenschutz</button>
      </footer>

      {/* DEKLARATIVE MODALS */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0c0c0c] border border-neutral-900 w-full max-w-lg max-h-[75vh] rounded-sm p-6 flex flex-col justify-between shadow-2xl">
            <div className="overflow-y-auto pr-2 space-y-4 text-xs text-neutral-400 leading-relaxed font-mono">
              {activeModal === 'impressum' ? (
                <>
                  <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-2">Impressum</h3>
                  <p>Angaben gemäß § 5 TMG:</p>
                  <p>[Dein vollständiger Name]<br />[Deine private Anschrift]<br />[Deine PLZ und Ort]</p>
                  <p>Kontakt:<br />E-Mail: [Deine E-Mail-Adresse]</p>
                  <p>Haftungsausschluss: Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links.</p>
                </>
              ) : (
                <>
                  <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-2">Datenschutzerklärung</h3>
                  <p>1. Datenschutz auf einen Blick</p>
                  <p>Wir erheben deine E-Mail-Adresse ausschließlich zur Benachrichtigung über den Start von Hyperdealz.de. Es findet keine Weitergabe an unbefugte Dritte statt.</p>
                  <p>2. Speicherung und Löschung</p>
                  <p>Die Daten werden direkt in einer gesicherten PostgreSQL-Instanz bei Supabase gespeichert und durch strenge Row Level Security (RLS) geschützt. Du kannst der Speicherung jederzeit formlos widersprechen.</p>
                </>
              )}
            </div>
            <button
              onClick={() => { triggerHaptic(10); setActiveModal('none'); }}
              className="w-full mt-6 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[10px] uppercase tracking-widest py-3 rounded-sm transition-all"
            >
              [ Schließen ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
