import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase-Client initialisieren (Umgebungsvariablen über Vite einpflegen)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type ModalType = 'none' | 'impressum' | 'datenschutz';

export default function App() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vipId, setVipId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  
  // Ref für den Slot-Machine-Zähler (Verhindert React-DOM-Overhead beim Hochzählen)
  const counterRef = useRef<HTMLSpanElement>(null);

  // Haptisches Feedback Hilfsfunktion
  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  // Slot-Machine-Animation für die VIP-Nummer
  const animateSlotMachine = (targetId: number) => {
    let current = 0;
    const duration = 1200; // ms
    const steps = 30;
    const stepTime = duration / steps;
    
    triggerHaptic([30, 50, 30]); // Start-Vibration

    const interval = setInterval(() => {
      current += Math.ceil(targetId / steps);
      if (current >= targetId) {
        current = targetId;
        clearInterval(interval);
        triggerHaptic(40); // Harter finaler Stop-Puls
      }
      
      if (counterRef.current) {
        // Direkte DOM-Mutation zur Performance-Schonung
        counterRef.current.textContent = `#${String(current).padStart(4, '0')}`;
      }
    }, stepTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    triggerHaptic(15); // Klick-Feedback

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{ email }])
        .select('id')
        .single();

      if (error) {
        if (error.code === '23505') {
          alert('Diese E-Mail-Adresse ist bereits für den VIP-Launch registriert.');
        } else {
          throw error;
        }
      } else if (data) {
        setVipId(String(data.id).padStart(4, '0'));
        // Starte Slot-Machine nach kurzem Delay
        setTimeout(() => animateSlotMachine(data.id), 100);
      }
    } catch (err) {
      console.error('Fehler beim Lead-Inbound:', err);
      alert('System kurz ausgelastet. Bitte versuche es gleich noch einmal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between items-center p-6 font-sans selection:bg-[#bf953f] selection:text-black">
      
      {/* TOP: Platzhalter für zukünftigen Banner-Slot (Rechtliche Compliance: Sichtbar) */}
      <div className="w-full max-w-md h-12 border border-neutral-900 bg-[#0c0c0c] flex items-center justify-center rounded text-xs text-neutral-600 tracking-widest uppercase">
        Hyperdealz Operational Hub — Secure Link
      </div>

      {/* CENTER: Das Kern-Panel */}
      <main className="w-full max-w-md bg-[#0c0c0c] border border-neutral-900 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(191,149,63,0.03)] transition-all duration-500 hover:shadow-[0_0_60px_rgba(191,149,63,0.06)]">
        
        {/* Subtiler Gold-Gradient im Hintergrund */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#bf953f] opacity-[0.02] blur-[100px] pointer-events-none" />

        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] bg-clip-text text-transparent uppercase">
            Hyperdealz.de
          </h1>
          <p className="text-xs text-neutral-400 mt-2 font-mono uppercase tracking-widest">
            Halbverdeckte Rückwärts-Auktionen
          </p>
        </div>

        {!vipId ? (
          /* FORMULAR-STATE */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-medium text-neutral-200">Sichere dir VIP-Priorität</h2>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Keine Textwüsten. Reine Performance. Registrierung rein via passwortlosem Klick.
              </p>
            </div>

            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => triggerHaptic(10)} // Sanfter Input-Fokus-Puls
                placeholder="Deine E-Mail-Adresse"
                className="w-full bg-[#000000] border border-neutral-800 focus:border-[#bf953f] rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-600 focus:outline-none transition-all duration-300 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0c0c0c] hover:bg-[#121212] border border-[#bf953f] text-[#bf953f] hover:text-[#fcf6ba] font-mono text-xs uppercase tracking-widest py-4 rounded-xl font-bold transition-all duration-300 transform active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? 'Verarbeite Inbound...' : '[ VIP-LAUNCH-CODE ANFORDERN ]'}
            </button>
          </form>
        ) : (
          /* SUCCESS-STATE (Slot Machine) */
          <div className="text-center space-y-6 py-4 animate-fade-in">
            <div className="w-12 h-12 bg-neutral-900 border border-[#bf953f]/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(191,149,63,0.1)]">
              <span className="text-[#bf953f] text-lg">✓</span>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-md uppercase tracking-wider text-neutral-400 font-mono">Dein System-Status</h2>
              {/* Hier mutiert die Slot-Machine-Animation direkt rein */}
              <span 
                ref={counterRef} 
                className="block text-4xl font-extrabold font-mono tracking-wider text-white tabular-nums"
              >
                #0000
              </span>
            </div>

            <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
              Dein Einlass-Token wurde kryptografisch gesichert. Wir senden dir deinen Zugangscode vor allen anderen an <span className="text-neutral-300 font-mono">{email}</span>.
            </p>
          </div>
        )}
      </main>

      {/* BOTTOM: Gesetzlicher Footer (2-Klick-Regel, deklarative Modals) */}
      <footer className="w-full max-w-md flex justify-center space-x-6 text-[10px] font-mono uppercase tracking-wider text-neutral-600 my-4 z-10">
        <button onClick={() => { triggerHaptic(10); setActiveModal('impressum'); }} className="hover:text-[#bf953f] transition-colors">
          Impressum
        </button>
        <button onClick={() => { triggerHaptic(10); setActiveModal('datenschutz'); }} className="hover:text-[#bf953f] transition-colors">
          Datenschutz
        </button>
      </footer>

      {/* DEKLARATIVE MODALS (Rechtssicher eingebettet) */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#0c0c0c] border border-neutral-900 w-full max-w-lg max-h-[75vh] rounded-2xl p-6 flex flex-col justify-between shadow-2xl">
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
              className="w-full mt-6 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all"
            >
              [ Schließen ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
