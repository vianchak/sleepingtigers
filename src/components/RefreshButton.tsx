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
      // Tell Next.js router to refresh the current page data from the server
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      // Small timeout so the spin animation completes a cycle
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <button 
      onClick={handleRefresh} 
      disabled={isRefreshing}
      className="p-2 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-50 ml-4"
      title="Refresh Data"
    >
      <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
    </button>
  );
}
