import { getTranslations } from 'next-intl/server';
import { getLeagueHistory } from '@/lib/sleeper-api';
import { Trophy, Skull, Crown, Trash2 } from 'lucide-react';
import Image from 'next/image';

export const revalidate = 3600;

export default async function HistoryPage() {
  const t = await getTranslations('History');
  const leagueId = process.env.NEXT_PUBLIC_SLEEPER_LEAGUE_ID;
  if (!leagueId) {
    return <div className="text-red-500">Error: NEXT_PUBLIC_SLEEPER_LEAGUE_ID is not set.</div>;
  }

  const history = await getLeagueHistory(leagueId);

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
        <Trophy className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-slate-300">{t('noHistory')}</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          {t('noHistoryDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-4xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 mb-4 flex items-center justify-center gap-3">
          <HistoryIcon /> {t('title')}
        </h2>
        <p className="text-slate-400">
          {t('description')}
        </p>
      </div>

      <div className="space-y-16">
        {history.map((season) => (
          <div key={season.year} className="relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <span className="text-[20rem] font-bold font-heading">{season.year}</span>
            </div>
            
            <h3 className="text-3xl font-bold text-center mb-8 text-slate-300 relative z-10">{season.year}{t('season')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              
              {/* Hall of Fame (Winner) */}
              <div className="glass-card p-8 border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)] relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-600 to-amber-400"></div>
                <div className="w-24 h-24 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center mb-6 relative">
                  <Crown className="w-12 h-12" />
                </div>
                
                <h4 className="font-bold text-2xl mb-1 text-yellow-400">{t('leagueChampion')}</h4>
                
                {season.winner ? (
                  <>
                    <div className="my-6">
                      {season.winner.avatarUrl ? (
                        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-yellow-500/50 shadow-lg">
                          <Image src={season.winner.avatarUrl} alt={season.winner.displayName} width={80} height={80} />
                        </div>
                      ) : (
                        <div className="w-20 h-20 mx-auto rounded-full bg-slate-700 flex items-center justify-center border-4 border-yellow-500/50 shadow-lg">
                          <span className="font-bold text-2xl">{season.winner.displayName.substring(0, 2).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-white text-3xl mb-2">{season.winner.displayName}</p>
                    <p className="text-yellow-300/80">
                      {t('record')}{season.winner.wins}-{season.winner.losses} | {season.winner.fpts.toFixed(1)}{t('pf')}{season.winner.fptsAgainst.toFixed(1)} {t('pa')}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-500 mt-8">{t('dataUnavailable')}</p>
                )}
              </div>

              {/* Hall of Infamy (Loser) */}
              <div className="glass-card p-8 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)] relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-400"></div>
                <div className="w-24 h-24 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-6 relative">
                  <Trash2 className="w-12 h-12" />
                </div>
                
                <h4 className="font-bold text-2xl mb-1 text-red-400">{t('lastPlace')}</h4>
                
                {season.loser ? (
                  <>
                    <div className="my-6">
                      {season.loser.avatarUrl ? (
                        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-red-500/50 shadow-lg">
                          <Image src={season.loser.avatarUrl} alt={season.loser.displayName} width={80} height={80} />
                        </div>
                      ) : (
                        <div className="w-20 h-20 mx-auto rounded-full bg-slate-700 flex items-center justify-center border-4 border-red-500/50 shadow-lg">
                          <span className="font-bold text-2xl">{season.loser.displayName.substring(0, 2).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-white text-3xl mb-2">{season.loser.displayName}</p>
                    <p className="text-red-300/80">
                      {t('record')}{season.loser.wins}-{season.loser.losses} | {season.loser.fpts.toFixed(1)}{t('pf')}{season.loser.fptsAgainst.toFixed(1)} {t('pa')}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-500 mt-8">{t('dataUnavailable')}</p>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M12 7v5l4 2"/>
    </svg>
  );
}


export const runtime = 'edge';

