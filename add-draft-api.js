const fs = require('fs');
const file = 'src/lib/sleeper-api.ts';
let content = fs.readFileSync(file, 'utf8');

const newCode = `
export async function getDraftReport(leagueId: string) {
  // Fetch drafts
  const drafts = await fetchWithCache(\`/league/\${leagueId}/drafts\`).catch(() => []);
  if (!drafts || drafts.length === 0) return { steal: null, bust: null };
  const draftId = drafts[0].draft_id;

  // Fetch picks and users
  const [picks, users] = await Promise.all([
    fetchWithCache(\`/draft/\${draftId}/picks\`).catch(() => []),
    getUsers(leagueId)
  ]);
  
  if (!picks || picks.length === 0) return { steal: null, bust: null };

  const userMap = new Map();
  for (const u of users) userMap.set(u.user_id, u);

  // Fetch all matchups to get player points
  const weekPromises = [];
  for (let week = 1; week <= 18; week++) {
    weekPromises.push(fetchWithCache(\`/league/\${leagueId}/matchups/\${week}\`).catch(() => []));
  }
  const allMatchups = await Promise.all(weekPromises);

  const playerPoints = new Map<string, number>();
  
  for (const matchupsForWeek of allMatchups) {
    if (!matchupsForWeek) continue;
    for (const match of matchupsForWeek) {
      if (match.players_points) {
        for (const [playerId, points] of Object.entries(match.players_points)) {
          const current = playerPoints.get(playerId) || 0;
          playerPoints.set(playerId, current + (points as number));
        }
      }
    }
  }

  const parsedPicks = picks.map((p: any) => {
    const totalPoints = playerPoints.get(p.player_id) || 0;
    const user = userMap.get(p.picked_by);
    return {
      pickNo: p.pick_no,
      round: p.round,
      playerId: p.player_id,
      playerName: \`\${p.metadata.first_name} \${p.metadata.last_name}\`,
      position: p.metadata.position,
      team: p.metadata.team || 'FA',
      rosterId: p.roster_id,
      pickedBy: user?.display_name || 'Unknown',
      totalPoints,
      valueScore: totalPoints * (p.pick_no / 10) // Normalize pick no multiplier
    };
  });

  // Exclude DEF and K for busts, require they played at least some snaps (points > 0 to filter out completely irrelevant players, but wait, a bust could be injured and score 0. But let's say round <= 3)
  const premiumPicks = parsedPicks.filter((p: any) => p.round <= 3 && p.position !== 'DEF' && p.position !== 'K');
  const bust = premiumPicks.length > 0 ? premiumPicks.reduce((prev: any, current: any) => (prev.totalPoints < current.totalPoints) ? prev : current) : null;

  // Steals are late round picks (Round 8+) that scored well
  const latePicks = parsedPicks.filter((p: any) => p.round >= 8 && p.position !== 'DEF' && p.position !== 'K' && p.totalPoints > 20);
  const steal = latePicks.length > 0 ? latePicks.reduce((prev: any, current: any) => (prev.valueScore > current.valueScore) ? prev : current) : null;

  return { steal, bust };
}
`;

content += newCode;
fs.writeFileSync(file, content);
console.log('Done');
