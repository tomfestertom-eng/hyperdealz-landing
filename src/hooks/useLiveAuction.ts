import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useLiveAuction(auctionId: string) {
  const [auction, setAuction] = useState<any>(null);

  useEffect(() => {
    // 1. Initialen Zustand laden
    supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single()
      .then(({ data }) => setAuction(data));

    // 2. Realtime-Kanal für den sekundenschnellen Ticker abonnieren
    const channel = supabase
      .channel(`live-auction:${auctionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'auctions', filter: `id=eq.${auctionId}` },
        (payload) => {
          setAuction(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId]);

  return auction;
}
