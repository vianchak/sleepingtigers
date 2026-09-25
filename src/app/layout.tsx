import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Trophy, Activity, ArrowRightLeft, History, CalendarDays, Swords, Search } from 'lucide-react';
import { RefreshButton } from '@/components/RefreshButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Oklahoma Rejects Analytics',
  description: 'Advanced analytics and true standings for Sleeper fantasy football leagues.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-slate-100 antialiased`}>
        <div className="flex flex-col min-h-screen">
          <header className="glass-panel sticky top-0 z-50 rounded-none border-t-0 border-x-0 border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                <Trophy className="w-6 h-6 text-slate-900" />
              </div>
              <h1 className="text-xl font-bold text-gradient">Oklahoma Rejects Analytics</h1>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
                <Trophy className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link href="/schedule" className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
                <CalendarDays className="w-4 h-4" />
                <span>Schedule</span>
              </Link>
              <Link href="/true-standings" className="flex items-center space-x-1 hover:text-emerald-400 transition-colors">
                <Activity className="w-4 h-4" />
                <span>True Standings</span>
              </Link>
              <Link href="/multiverse" className="flex items-center space-x-1 hover:text-purple-400 transition-colors">
                <ArrowRightLeft className="w-4 h-4" />
                <span>The Multiverse</span>
              </Link>
              <Link href="/rivalries" className="flex items-center space-x-1 hover:text-rose-400 transition-colors">
                <Swords className="w-4 h-4" />
                <span>Rivalries</span>
              </Link>
              <Link href="/draft-report" className="flex items-center space-x-1 hover:text-indigo-400 transition-colors">
                <Search className="w-4 h-4" />
                <span>Draft Report</span>
              </Link>
              <Link href="/history" className="flex items-center space-x-1 hover:text-yellow-400 transition-colors">
                <History className="w-4 h-4" />
                <span>History</span>
              </Link>
            </nav>
            <div className="hidden md:flex items-center">
              <RefreshButton />
            </div>
          </header>
          
          <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>

          <footer className="py-6 text-center text-sm text-slate-500 border-t border-white/5 mt-8">
            <p>Stateless API-driven dashboard. Built with Next.js & Tailwind CSS.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
