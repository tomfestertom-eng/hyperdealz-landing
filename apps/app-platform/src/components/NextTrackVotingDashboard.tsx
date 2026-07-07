import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Crown, AlertCircle } from 'lucide-react';

interface VotingItem {
  id: string;
  product_name: string;
  category: string;
  total_weighted_points: number;
}

interface NextTrackVotingDashboardProps {
  /** 
   * Wird idealerweise über einen globalen UserContext oder JWT-Claim injected.
   * Für Demonstrationszwecke hier als Prop.
   */
  userIsVip?: boolean;
}

export function NextTrackVotingDashboard({ userIsVip = false }: NextTrackVotingDashboardProps) {
  const [items, setItems] = useState<VotingItem[]>([]);
  const [errorItemId, setErrorItemId] = useState<string | null>(null);

  // Initial load & Realtime Sync
  useEffect(() => {
    fetchVotes();
    
    const channel = supabase
      .channel('next-track-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'next_track_voting' }, () => {
        fetchVotes(); // Einfacher Re-fetch bei Änderungen
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVotes = async () => {
    const { data, error } = await supabase
      .from('next_track_voting')
      .select('*')
      .order('total_weighted_points', { ascending: false });
    
    if (data && !error) {
      setItems(data);
    }
  };

  const handleVote = async (id: string) => {
    // Kurzes haptisches Feedback für den Klick
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
    
    const { data, error } = await supabase.rpc('cast_track_vote', {
      track_id: id
    });

    const isAlreadyVoted = error?.message?.includes('ALREADY_VOTED') || data === 'ALREADY_VOTED';

    if (error || isAlreadyVoted) {
      // Error-Feedback: Rotes Aufblitzen & Warnton-Haptik
      if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 40, 50]);
      setErrorItemId(id);
      setTimeout(() => setErrorItemId(null), 600);
    }
  };

  // Berechnung für die relativen Fortschrittsbalken
  const totalPoints = items.reduce((sum, item) => sum + item.total_weighted_points, 0) || 1;

  return (
    <div className="w-full max-w-md flex flex-col gap-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] text-neutral-500 tracking-[0.2em] uppercase">Next Track Voting</h3>
        {userIsVip && (
          <span className="flex items-center gap-1.5 text-[9px] text-[#bf953f] bg-[#bf953f]/10 px-2 py-0.5 rounded-full border border-[#bf953f]/30">
            <Crown className="w-3 h-3" />
            3x VIP Power
          </span>
        )}
      </div>

      {/* Voting List */}
      {items.length === 0 ? (
        <p className="text-xs text-neutral-600 text-center py-4 italic">Waiting for backend data...</p>
      ) : (
        items.map((item) => {
          const percentage = Math.min(100, Math.round((item.total_weighted_points / totalPoints) * 100));
          const isError = errorItemId === item.id;

          return (
            <div 
              key={item.id}
              className={`relative w-full h-12 bg-[#0c0c0c] rounded-lg border transition-colors duration-300 overflow-hidden flex items-center justify-between px-4 group ${
                isError ? 'border-red-500/80' : 'border-neutral-900 hover:border-neutral-700'
              }`}
            >
              {/* Progress Bar (Background) */}
              <div 
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-600/15 to-yellow-500/20 transition-all duration-700 ease-out z-0"
                style={{ width: `${percentage}%` }}
              ></div>

              {/* Content (Foreground) */}
              <div className="relative z-10 flex flex-col pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                    {item.product_name}
                  </span>
                  {userIsVip && <Crown className="w-3 h-3 text-[#bf953f]/70" />}
                </div>
                <span className="text-[9px] text-neutral-600 tracking-widest uppercase mt-0.5">
                  {item.category} • {item.total_weighted_points} Pts
                </span>
              </div>

              {/* Vote Button */}
              <button
                onClick={() => handleVote(item.id)}
                className={`relative z-10 w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                  isError 
                    ? 'bg-red-500/10 text-red-500' 
                    : 'bg-neutral-900/80 text-neutral-500 hover:text-[#bf953f] hover:bg-neutral-800 border border-neutral-800'
                }`}
                title="Vote for this track"
              >
                {isError ? (
                  <AlertCircle className="w-4 h-4 animate-pulse" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
