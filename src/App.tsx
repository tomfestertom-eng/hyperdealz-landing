import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase-Client initialisieren
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type ModalType = 'none' | 'impressum' | 'datenschutz';

export default function App() {
  const [email, setEmail] = useState('');
  const [statusId, setStatusId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  
  // Ref für den Slot-Machine-Zähler zur render-freien Mutation
  const counterRef = useRef<HTMLSpanElement>(null);

  // Haptische Kapselung mit Feature-Detection
  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        console.warn('Haptic feedback not supported', e);
      }
    }
  };

  // Slot-Machine-Animation über native DOM-Mutation
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
    triggerHaptic(10);

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
        const formattedId = String(data.id).padStart(4, '0');
        setStatusId(formattedId);
        setTimeout(() => animateSlotMachine(data.id), 100);
      }
    } catch (err) {
      triggerHaptic(200);
      console.error('Lead insertion failed:', err);
      alert('System ausgelastet. Bitte später erneut versuchen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] text-white flex flex-col items-center justify-center relative px-6 font-sans antialiased selection:bg-[#BF953F]/30">
      
      {/* Haupt-Container, zentral ausgerichtet */}
      <main className="w-full max-w-sm flex flex-col items-center z-10 w-full mb-16">
        
        {/* Typografie & Header */}
        <h1 className="text-3xl font-extrabold tracking-widest uppercase bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent text-center">
          HYPERDEALZ
        </h1>
        
        {/* Sub-Header: System Aktiv / Pre-Launch (Grün/Grau) */}
        <div className="flex items-center gap-2 mt-2 text-[10px] tracking-widest uppercase text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          System Aktiv / Pre-Launch
        </div>

        <div className="w-full mt-12">
          {!statusId ? (
            <div className="flex flex-col items-center w-full gap-3">
              {/* Formular-Header (sehr klein, graue Monospace) */}
              <p className="text-[9px] tracking-[0.2em] text-neutral-500 uppercase font-mono text-center">
                Zugangskapazität limitiert.
              </p>

              {/* Input-Feld & Button */}
              <form 
                onSubmit={handleSubmit} 
                className="w-full relative flex items-center bg-[#0c0c0c] border border-neutral-900 rounded-xl focus-within:border-[#BF953F] transition-colors duration-300 overflow-hidden"
              >
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => triggerHaptic(10)}
                  placeholder="mail@domain.tld" 
                  className="w-full bg-transparent px-4 py-3.5 text-sm text-neutral-200 placeholder-neutral-700 outline-none font-mono tracking-wide"
                  style={{
                    WebkitBoxShadow: '0 0 0 30px #0c0c0c inset',
                    WebkitTextFillColor: '#E5E5E5',
                  }}
                  disabled={isSubmitting}
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-2 px-3 py-2 text-neutral-600 hover:text-[#FCF6BA] transition-colors font-bold text-lg disabled:opacity-30 bg-transparent"
                >
                  {isSubmitting ? '...' : '›'}
                </button>
              </form>
            </div>
          ) : (
            /* Minimalistischer Success-State mit Slot-Machine */
            <div className="w-full flex flex-col items-center gap-6 animate-fade-in mt-4">
              <div className="w-12 h-12 bg-[#0c0c0c] border border-[#BF953F]/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(191,149,63,0.15)]">
                <span className="text-[#BF953F] text-xl">✓</span>
              </div>
              
              <div className="w-full py-5 bg-[#0c0c0c] border border-neutral-900 rounded-xl flex flex-col items-center justify-center gap-1.5">
                <h2 className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono">Status gesichert. ID:</h2>
                <span ref={counterRef} className="text-3xl font-extrabold font-mono tracking-widest text-[#FCF6BA] tabular-nums">
                  #0000
                </span>
              </div>
              
              <p className="text-[10px] tracking-widest text-neutral-600 max-w-[280px] text-center leading-relaxed font-mono uppercase">
                Token generiert.<br/>
                Empfänger: <span className="text-neutral-400">{email}</span>
              </p>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER (Impressum & Datenschutz am unteren Rand fixiert) */}
      <footer className="absolute bottom-6 w-full flex flex-row items-center justify-center gap-8 opacity-40 hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={() => { triggerHaptic(10); setActiveModal('impressum'); }}
          className="text-[9px] tracking-widest uppercase text-neutral-400 hover:text-[#BF953F] bg-transparent border-none cursor-pointer transition-colors"
        >
          Impressum
        </button>
        <button 
          onClick={() => { triggerHaptic(10); setActiveModal('datenschutz'); }}
          className="text-[9px] tracking-widest uppercase text-neutral-400 hover:text-[#BF953F] bg-transparent border-none cursor-pointer transition-colors"
        >
          Datenschutz
        </button>
      </footer>

      {/* DEKLARATIVE MODALS */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0c0c0c] border border-neutral-900 w-full max-w-lg max-h-[80vh] rounded-xl p-6 flex flex-col shadow-2xl">
            <div className="overflow-y-auto pr-2 space-y-4 text-[11px] tracking-wide text-neutral-400 leading-relaxed font-mono">
              {activeModal === 'impressum' ? (
                <>
                  <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-3 border-b border-neutral-900 pb-2">Impressum</h3>
                  <p className="uppercase text-neutral-500 mb-1 text-[9px] tracking-widest">Angaben gemäß § 5 TMG</p>
                  <p>[Dein vollständiger Name]<br />[Deine private Anschrift]<br />[Deine PLZ und Ort]</p>
                  <p className="uppercase text-neutral-500 mb-1 mt-3 text-[9px] tracking-widest">Kontakt</p>
                  <p>E-Mail: [Deine E-Mail-Adresse]</p>
                  <p className="uppercase text-neutral-500 mb-1 mt-3 text-[9px] tracking-widest">Haftungsausschluss</p>
                  <p>Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links.</p>
                </>
              ) : (
                <>
                  <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-3 border-b border-neutral-900 pb-2">Datenschutzerklärung</h3>
                  <p className="uppercase text-neutral-500 mb-1 text-[9px] tracking-widest">1. Datenschutz auf einen Blick</p>
                  <p>Wir erheben deine E-Mail-Adresse ausschließlich zur Benachrichtigung über den Start von Hyperdealz.de. Es findet keine Weitergabe an unbefugte Dritte statt.</p>
                  <p className="uppercase text-neutral-500 mb-1 mt-3 text-[9px] tracking-widest">2. Speicherung und Löschung</p>
                  <p>Die Daten werden direkt in einer gesicherten PostgreSQL-Instanz bei Supabase gespeichert und durch strenge Row Level Security (RLS) geschützt. Du kannst der Speicherung jederzeit formlos widersprechen.</p>
                </>
              )}
            </div>
            <button
              onClick={() => { triggerHaptic(10); setActiveModal('none'); }}
              className="w-full mt-6 bg-[#111111] hover:bg-[#1a1a1a] border border-neutral-800 text-neutral-400 hover:text-[#BF953F] font-mono text-[10px] uppercase tracking-widest py-3.5 rounded-lg transition-colors cursor-pointer"
            >
              [ Schließen ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
