import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Terminal, AlertTriangle } from 'lucide-react';

export function AdminVotingController() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forceResolve = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('resolve_active_voting_round');
      
      if (rpcError) {
        setError(rpcError.message);
      } else {
        setResult(data || { status: "SUCCESS", message: "Round resolved." });
        if (typeof window !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unknown execution error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-[#121212] border border-yellow-500/50 rounded-xl p-6 font-mono shadow-2xl">
      <div className="flex items-center gap-2 mb-4 text-yellow-500">
        <AlertTriangle className="w-5 h-5" />
        <h2 className="text-xs font-bold tracking-widest uppercase">Admin Override: Voting Resolution</h2>
      </div>

      <button
        onClick={forceResolve}
        disabled={loading}
        className="w-full relative group overflow-hidden bg-black border border-yellow-600/50 hover:border-yellow-400 text-yellow-500 transition-all py-3 px-4 rounded-md flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Terminal className="w-4 h-4" />
        <span className="text-xs font-bold tracking-[0.2em] uppercase">
          {loading ? 'EXECUTING RPC...' : '[ FORCE ROUND RESOLUTION ]'}
        </span>
        <div className="absolute inset-0 bg-yellow-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      </button>

      {/* Error Output */}
      {error && (
        <div className="mt-4 p-3 bg-red-950/30 border border-red-900/50 rounded text-[10px] text-red-500 break-words">
          <span className="font-bold">ERROR:</span> {error}
        </div>
      )}

      {/* JSON Result Output */}
      {result && (
        <div className="mt-4">
          <p className="text-[10px] text-neutral-500 mb-2 tracking-wider">RESPONSE PAYLOAD:</p>
          <pre className="bg-black border border-neutral-800 rounded p-4 text-[10px] text-emerald-400 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
