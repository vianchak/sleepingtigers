const fs = require('fs');
const file = 'src/lib/sleeper-api.ts';
let content = fs.readFileSync(file, 'utf8');

const newCode = `
export async function getAllTimeMatchups(currentLeagueId: string) {
  const allMatchups = [];
  let leagueIdToFetch: string | null = currentLeagueId;

  while (leagueIdToFetch) {
    const leagueData = await fetchWithCache(\`/league/\${leagueIdToFetch}\`);
    const season = leagueData.season;
    leagueIdToFetch = leagueData.previous_league_id || null;

    const [users, rosters] = await Promise.all([
      getUsers(leagueData.league_id),
      getRosters(leagueData.league_id)
    ]);

    const userMap = new Map();
    for (const u of users) {
      userMap.set(u.user_id, {
        userId: u.user_id,
        displayName: u.display_name,
        avatarUrl: u.avatar ? \`https://sleepercdn.com/avatars/thumbs/\${u.avatar}\` : null
      });
    }

    const rosterMap = new Map();
    for (const r of rosters) {
      if (r.owner_id) {
        rosterMap.set(r.roster_id, userMap.get(r.owner_id));
      }
    }

    const weekPromises = [];
    for (let week = 1; week <= 18; week++) {
      weekPromises.push(
        fetchWithCache(\`/league/\${leagueData.league_id}/matchups/\${week}\`)
          .catch(() => [])
          .then(data => ({ week, data }))
      );
    }
    const weeklyData = await Promise.all(weekPromises);

    for (const { week, data } of weeklyData) {
      if (!data || data.length === 0) continue;

      // Group by matchup_id
      const matchupPairs = new Map<number, any[]>();
      for (const m of data) {
        if (!m.matchup_id) continue;
        if (!matchupPairs.has(m.matchup_id)) matchupPairs.set(m.matchup_id, []);
        matchupPairs.get(m.matchup_id).push(m);
      }

      for (const pair of matchupPairs.values()) {
        if (pair.length === 2 && pair[0].points > 0 && pair[1].points > 0) { // Must have scores
          const userA = rosterMap.get(pair[0].roster_id);
          const userB = rosterMap.get(pair[1].roster_id);
          
          if (userA && userB) {
            allMatchups.push({
              season,
              week,
              teamA: { ...userA, points: pair[0].points },
              teamB: { ...userB, points: pair[1].points }
            });
          }
        }
      }
    }
  }

  return allMatchups;
}
`;

content += newCode;
fs.writeFileSync(file, content);
console.log('Done');
