const fs = require('fs');
const file = 'src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add imports
content = content.replace(
  "import { calculateBadges, calculateAllPlayRecord } from '@/lib/stats-engine';",
  "import { calculateBadges, calculateAllPlayRecord, calculatePowerRankings } from '@/lib/stats-engine';"
);
content = content.replace(
  "import { Award, Zap, HeartPulse, ShieldAlert, Skull, Wrench, Medal, Backpack, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';",
  "import { Award, Zap, HeartPulse, ShieldAlert, Skull, Wrench, Medal, Backpack, RefreshCw, Trash2, AlertTriangle, TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react';"
);

// Add power rankings calculation
content = content.replace(
  "const allPlay = calculateAllPlayRecord(teams);",
  "const allPlay = calculateAllPlayRecord(teams);\n  const powerRankings = calculatePowerRankings(teams);"
);

// Add Badges UI
content = content.replace(
  "        {/* Churn and Burn */}",
  `        {/* Best Ball Champion */}
        <div className="glass-card p-6 flex flex-col items-center text-center group relative cursor-help">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Crown className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-lg mb-1">Best Ball Champ</h4>
          <p className="text-xs text-slate-400 mb-4">Highest potential points</p>
          <div className="mt-auto">
            <p className="font-bold text-yellow-300">{badges.bestBallChampion?.team.displayName || 'N/A'}</p>
          </div>
          <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 shadow-xl z-50 transition-all duration-200 pointer-events-none">
            {badges.bestBallChampion?.reason}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
          </div>
        </div>

        {/* One-Hit Wonder */}
        <div className="glass-card p-6 flex flex-col items-center text-center group relative cursor-help">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-lg mb-1">One-Hit Wonder</h4>
          <p className="text-xs text-slate-400 mb-4">Biggest fluke week</p>
          <div className="mt-auto">
            <p className="font-bold text-cyan-300">{badges.oneHitWonder?.team.displayName || 'N/A'}</p>
          </div>
          <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-3 shadow-xl z-50 transition-all duration-200 pointer-events-none">
            {badges.oneHitWonder?.reason}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
          </div>
        </div>

        {/* Churn and Burn */}`
);

// Add Power Rankings UI before Parasha Section
const powerRankingsUI = `
      {/* Official Power Rankings */}
      <div className="mt-12 mb-12">
        <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-2">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              Official Power Rankings
            </h2>
          </div>
          <p className="text-sm text-slate-400 hidden sm:block">Algorithm: True Win % + Recent Form + Points For</p>
        </div>
        
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-300 text-center w-16">Rank</th>
                  <th className="px-6 py-4 font-bold text-slate-300">Manager</th>
                  <th className="px-6 py-4 font-bold text-slate-300 text-center hidden sm:table-cell">Power Score</th>
                  <th className="px-6 py-4 font-bold text-slate-300 text-center hidden md:table-cell">Recent Form</th>
                </tr>
              </thead>
              <tbody>
                {powerRankings.map((pr, idx) => (
                  <tr key={pr.team.rosterId} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <div className={\`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold \${idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-slate-800 text-slate-300'}\`}>
                        {pr.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {pr.team.avatarUrl ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-600">
                            <Image src={pr.team.avatarUrl} alt={pr.team.displayName} width={40} height={40} />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                            <span className="font-bold text-xs">{pr.team.displayName.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <p className={\`font-bold text-base \${idx === 0 ? 'text-yellow-400' : 'text-slate-200'}\`}>{pr.team.displayName}</p>
                          <p className="text-xs text-slate-500 md:hidden">Score: {(pr.powerScore * 100).toFixed(0)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center hidden sm:table-cell">
                      <div className="w-full bg-slate-800 rounded-full h-2.5 max-w-xs mx-auto">
                        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2.5 rounded-full" style={{ width: \`\${Math.min(pr.powerScore * 100, 100)}%\` }}></div>
                      </div>
                      <span className="text-xs text-slate-400 mt-1 block">{(pr.powerScore * 100).toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4 text-center hidden md:table-cell text-emerald-400 font-mono">
                      {pr.recentForm.toFixed(1)} <span className="text-xs text-slate-500 font-sans block">pts/wk</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Parasha Section */}`;

content = content.replace("      {/* Parasha Section */}", powerRankingsUI);

fs.writeFileSync(file, content);
console.log('Done');
