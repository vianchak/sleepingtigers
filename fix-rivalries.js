const fs = require('fs');
const file = 'src/lib/stats-engine.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /export function getRivalries\([^}]+\}[^}]+\}/s;

const newFunc = `export function getRivalries(allTimeMatchups: import('@/types/sleeper').AllTimeMatchup[]): Rivalry[] {
  const rivalries = new Map<string, Rivalry>();

  for (const match of allTimeMatchups) {
    const userA = match.teamA;
    const userB = match.teamB;

    // Create unique key regardless of order
    const pairKey = userA.userId < userB.userId 
      ? \`\${userA.userId}-\${userB.userId}\` 
      : \`\${userB.userId}-\${userA.userId}\`;

    if (!rivalries.has(pairKey)) {
      rivalries.set(pairKey, {
        managerA: userA.userId < userB.userId ? userA : userB,
        managerB: userA.userId < userB.userId ? userB : userA,
        winsA: 0,
        winsB: 0,
        totalMatches: 0
      });
    }
    
    const rivalry = rivalries.get(pairKey)!;
    rivalry.totalMatches++;

    const isA = rivalry.managerA.userId === userA.userId;
    
    if (userA.points > userB.points) {
      if (isA) rivalry.winsA++;
      else rivalry.winsB++;
    } else if (userB.points > userA.points) {
      if (isA) rivalry.winsB++;
      else rivalry.winsA++;
    }
  }

  // Filter out rivalries with 0 matches or ties only
  return Array.from(rivalries.values()).filter(r => r.totalMatches > 0 && r.winsA !== r.winsB).sort((a, b) => {
    // Sort by largest sweep, then total matches
    const diffA = Math.abs(a.winsA - a.winsB);
    const diffB = Math.abs(b.winsA - b.winsB);
    return diffB - diffA || b.totalMatches - a.totalMatches;
  });
}`;

content = content.replace(regex, newFunc);
fs.writeFileSync(file, content);
console.log('Done replacing getRivalries');
