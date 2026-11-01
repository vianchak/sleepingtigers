'use client';

import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/revalidate', { method: 'POST' });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <button 
      onClick={handleRefresh} 
      disabled={isRefreshing}
      className="h-9 w-9 rounded-lg bg-slate-950/80 border border-white/10 hover:bg-slate-800 hover:border-white/20 transition-all flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-50 cursor-pointer shrink-0"
      title="Refresh Data"
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
    </button>
  );
}
