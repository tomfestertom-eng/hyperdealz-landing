import { supabase } from './supabaseClient';

export async function registerBannerImpression(auctionId: string) {
  const { data, error } = await supabase.rpc('trigger_impression_and_decay', {
    target_auction_id: auctionId
  });

  if (error) {
    console.error('Decay Engine Error:', error);
    return null;
  }

  // Pure Dark Cyber UX: Wenn das Backend "trigger_haptic" sendet, vibriert das Smartphone
  if (data?.trigger_haptic && typeof navigator !== 'undefined' && navigator.vibrate) {
    // Kurzer, intensiver Doppel-Puls für kritische FOMO-Phasen
    navigator.vibrate([80, 40, 80]); 
  }

  return data; // Enthält { current_price, status, ... } für unser Server-Driven UI Update
}
