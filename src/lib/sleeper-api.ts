import { SleeperUser, SleeperRoster, SleeperMatchup, SleeperTransaction, TeamStats, LeagueHistory, HistoricalTeam, WeeklySchedule, ScheduleMatchup, ScheduleTeam } from '@/types/sleeper';

const BASE_URL = 'https://api.sleeper.app/v1';

async function fetchWithCache(endpoint: string) {
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers: { "User-Agent": "Mozilla/5.0 (compatible; SleepingTigers/1.0)" } });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);
  }
  return res.json();
}

export async function getNflState(): Promise<{ week: number; season_type: string, leg?: number }> {
  return fetchWithCache('/state/nfl');
}

export function getCompletedWeek(nflState: any): number {
  let currentWeek = nflState.season_type === 'regular' ? (nflState.week || nflState.leg || 1) : 14;
  if (nflState.season_type === 'pre') currentWeek = 0;
  if (nflState.season_type === 'post') currentWeek = 14; 

  const day = new Date().getDay();
  // 0=Sun, 1=Mon, 4=Thu, 5=Fri, 6=Sat
  // If it's any of these days, the current NFL week is ongoing, so the last completed week is currentWeek - 1.
  // On Tuesday/Wednesday, the games are done, so the week is completed.
  let completedWeek = currentWeek;
  if ([0, 1, 4, 5, 6].includes(day)) {
    completedWeek = currentWeek - 1;
  }
  return Math.max(0, completedWeek);
}

export async function getUsers(leagueId: string): Promise<SleeperUser[]> {
  return fetchWithCache(`/league/${leagueId}/users`);
}

export async function getRosters(leagueId: string): Promise<SleeperRoster[]> {
  return fetchWithCache(`/league/${leagueId}/rosters`);
}

export async function getMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> {
  return fetchWithCache(`/league/${leagueId}/matchups/${week}`);
}

export async function getTransactions(leagueId: string, week: number): Promise<SleeperTransaction[]> {
  return fetchWithCache(`/league/${leagueId}/transactions/${week}`);
}

export async function getLeagueData(leagueId: string): Promise<TeamStats[]> {
  const [users, rosters, nflState] = await Promise.all([
    getUsers(leagueId),
    getRosters(leagueId),
    getNflState(),
  ]);

  // Use the helper to determine which weeks are fully completed
  const completedWeek = getCompletedWeek(nflState);
  
  // Also we should ensure we don't fetch weeks that haven't happened if we only want played weeks,
  // but Sleeper returns 0s for future weeks. Let's fetch all 14 weeks to be safe, 
  // and we can filter out empty weeks in the stats engine.
  const TOTAL_REGULAR_SEASON_WEEKS = 14;
  const matchupPromises = [];
  const transactionPromises = [];
  for (let w = 1; w <= TOTAL_REGULAR_SEASON_WEEKS; w++) {
    matchupPromises.push(getMatchups(leagueId, w));
    transactionPromises.push(getTransactions(leagueId, w));
  }
  
  const allMatchupsByWeek = await Promise.all(matchupPromises);
  const allTransactionsByWeek = await Promise.all(transactionPromises);

  // Map users
  const userMap = new Map<string, SleeperUser>();
  for (const u of users) {
    userMap.set(u.user_id, u);
  }

  // Initialize TeamStats
  const teamStatsMap = new Map<number, TeamStats>();
  for (const roster of rosters) {
    const user = roster.owner_id ? userMap.get(roster.owner_id) : null;
    
    teamStatsMap.set(roster.roster_id, {
      rosterId: roster.roster_id,
      userId: roster.owner_id || `unowned-${roster.roster_id}`,
      displayName: user?.display_name || `Team ${roster.roster_id}`,
      avatarUrl: user?.avatar ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : null,
      wins: roster.settings.wins,
      losses: roster.settings.losses,
      ties: roster.settings.ties,
      fpts: (roster.settings.fpts || 0) + (roster.settings.fpts_decimal || 0) / 100,
      fptsAgainst: (roster.settings.fpts_against || 0) + (roster.settings.fpts_against_decimal || 0) / 100,
      ppts: (roster.settings.ppts || 0) + (roster.settings.ppts_decimal || 0) / 100,
      totalMoves: roster.settings.total_moves || 0,
      participationTrophies: 0,
      maxPlayerPercentage: 0,
      weeklyScores: {},
      weeklyBenchPoints: {},
      weeklyMatchupIds: {},
      weeklyOpponentRosterIds: {}
    });
  }

  // Populate matchups
  allMatchupsByWeek.forEach((matchups, index) => {
    const week = index + 1;
    
    // Ignore matchups that haven't fully completed yet
    if (week > completedWeek) return;

    // Map matchup_id to roster_ids
    const matchupToRosters = new Map<number, number[]>();
    
    for (const match of matchups) {
      if (!matchupToRosters.has(match.matchup_id)) {
        matchupToRosters.set(match.matchup_id, []);
      }
      matchupToRosters.get(match.matchup_id)!.push(match.roster_id);
      
      const team = teamStatsMap.get(match.roster_id);
      if (team) {
        team.weeklyScores[week] = match.points;
        
        let benchPoints = 0;
        if (match.players_points && match.starters_points) {
           const playerScores = Object.values(match.players_points);
           const allPoints = playerScores.reduce((sum, p) => sum + p, 0);
           const starterPoints = match.starters_points.reduce((sum, p) => sum + p, 0);
           benchPoints = allPoints - starterPoints;
           
           // Calculate max player percentage
           if (match.points > 0) {
             const maxScore = Math.max(...match.starters_points);
             const percentage = maxScore / match.points;
             if (percentage > team.maxPlayerPercentage) {
                team.maxPlayerPercentage = percentage;
             }
           }
        }
        team.weeklyBenchPoints[week] = benchPoints;
        
        team.weeklyMatchupIds[week] = match.matchup_id;
      }
    }

    // Assign opponents
    for (const [matchupId, rosterIds] of Array.from(matchupToRosters.entries())) {
      if (rosterIds.length === 2) {
        const team1 = teamStatsMap.get(rosterIds[0]);
        const team2 = teamStatsMap.get(rosterIds[1]);
        if (team1) team1.weeklyOpponentRosterIds[week] = rosterIds[1];
        if (team2) team2.weeklyOpponentRosterIds[week] = rosterIds[0];
      } else if (rosterIds.length === 1) {
        // Bye week
        const team1 = teamStatsMap.get(rosterIds[0]);
        if (team1) team1.weeklyOpponentRosterIds[week] = null;
      }
    }
  });

  // Calculate live total moves from transactions
  const liveTotalMovesMap = new Map<number, number>();
  allTransactionsByWeek.forEach(transactions => {
    for (const tx of transactions) {
      if (tx.status === 'complete' && tx.roster_ids) {
        for (const rosterId of tx.roster_ids) {
          liveTotalMovesMap.set(rosterId, (liveTotalMovesMap.get(rosterId) || 0) + 1);
        }
      }
    }
  });

  // Calculate live records/points to handle the Tuesday rollover delay
  for (const team of teamStatsMap.values()) {
    let liveWins = 0, liveLosses = 0, liveTies = 0, liveFpts = 0, liveFptsAgainst = 0;
    
    for (const weekStr of Object.keys(team.weeklyScores)) {
       const week = Number(weekStr);
       const score = team.weeklyScores[week];
       
       if (score > 0) liveFpts += score;
       
       const oppId = team.weeklyOpponentRosterIds[week];
       if (oppId) {
          const oppTeam = teamStatsMap.get(oppId);
          if (oppTeam) {
            const oppScore = oppTeam.weeklyScores[week] || 0;
            if (oppScore > 0) liveFptsAgainst += oppScore;
            
            if (score > 0 || oppScore > 0) {
              if (score > oppScore) liveWins++;
              else if (score < oppScore) liveLosses++;
              else liveTies++;
            }
          }
       }
    }
    
    // Use the live computed data if it's greater (which means the week hasn't rolled over yet)
    team.wins = Math.max(team.wins || 0, liveWins);
    team.losses = Math.max(team.losses || 0, liveLosses);
    team.ties = Math.max(team.ties || 0, liveTies);
    team.fpts = Math.max(team.fpts || 0, liveFpts);
    team.fptsAgainst = Math.max(team.fptsAgainst || 0, liveFptsAgainst);
    
    const liveMoves = liveTotalMovesMap.get(team.rosterId) || 0;
    team.totalMoves = Math.max(team.totalMoves || 0, liveMoves);
  }

  return Array.from(teamStatsMap.values());
}

export async function getLeagueHistory(currentLeagueId: string): Promise<LeagueHistory[]> {
  const history: LeagueHistory[] = [];
  
  let leagueIdToFetch = currentLeagueId;
  
  const currentLeagueRes = await fetchWithCache(`/league/${currentLeagueId}`);
  if (!currentLeagueRes.previous_league_id) return history;
  
  leagueIdToFetch = currentLeagueRes.previous_league_id;

  while (leagueIdToFetch) {
    const leagueData = await fetchWithCache(`/league/${leagueIdToFetch}`);
    const year = leagueData.season;
    
    const [users, rosters, winnersBracket, losersBracket] = await Promise.all([
      getUsers(leagueIdToFetch),
      getRosters(leagueIdToFetch),
      fetchWithCache(`/league/${leagueIdToFetch}/winners_bracket`).catch(() => []),
      fetchWithCache(`/league/${leagueIdToFetch}/losers_bracket`).catch(() => [])
    ]);

    const userMap = new Map<string, SleeperUser>();
    for (const u of users) userMap.set(u.user_id, u);

    const getTeam = (rosterId: number): HistoricalTeam | null => {
      const roster = rosters.find(r => r.roster_id === rosterId);
      if (!roster) return null;
      const user = roster.owner_id ? userMap.get(roster.owner_id) : null;
      return {
        rosterId,
        userId: roster.owner_id || `unowned-${rosterId}`,
        displayName: user?.display_name || `Team ${rosterId}`,
        avatarUrl: user?.avatar ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : null,
        wins: roster.settings.wins || 0,
        losses: roster.settings.losses || 0,
        ties: roster.settings.ties || 0,
        fpts: (roster.settings.fpts || 0) + (roster.settings.fpts_decimal || 0) / 100,
        fptsAgainst: (roster.settings.fpts_against || 0) + (roster.settings.fpts_against_decimal || 0) / 100
      };
    };

    const championshipMatch = winnersBracket.find((m: any) => m.p === 1);
    const winnerRosterId = championshipMatch?.w;
    
    let loserRosterId = null;
    if (losersBracket && losersBracket.length > 0) {
      // In this league, the "Toilet Bowl" is awarded to the WINNER of the losers bracket.
      const toiletBowlMatch = losersBracket.find((m: any) => m.p === 1);
      loserRosterId = toiletBowlMatch?.w; 
    } else {
      const sortedRosters = [...rosters].sort((a, b) => 
        (a.settings.wins - b.settings.wins) || 
        ((a.settings.fpts || 0) - (b.settings.fpts || 0))
      );
      loserRosterId = sortedRosters[0]?.roster_id;
    }

    history.push({
      year,
      leagueId: leagueIdToFetch,
      winner: winnerRosterId ? getTeam(winnerRosterId) : null,
      loser: loserRosterId ? getTeam(loserRosterId) : null,
    });

    leagueIdToFetch = leagueData.previous_league_id;
  }
  
  return history;
}

export async function getSchedule(leagueId: string): Promise<WeeklySchedule[]> {
  const [users, rosters, nflState] = await Promise.all([
    getUsers(leagueId),
    getRosters(leagueId),
    fetchWithCache('https://api.sleeper.app/v1/state/nfl').catch(() => ({ leg: 1, season_type: 'regular' }))
  ]);

  const completedWeek = getCompletedWeek(nflState);
  
  const userMap = new Map<string, SleeperUser>();
  for (const u of users) userMap.set(u.user_id, u);

  const getTeamInfo = (rosterId: number, points: number): ScheduleTeam => {
    const roster = rosters.find(r => r.roster_id === rosterId);
    const user = roster?.owner_id ? userMap.get(roster.owner_id) : null;
    return {
      rosterId,
      name: user?.display_name || `Team ${rosterId}`,
      avatarUrl: user?.avatar ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : null,
      points
    };
  };

  const schedule: WeeklySchedule[] = [];

  const weekPromises = [];
  for (let week = 1; week <= 18; week++) {
    weekPromises.push(fetchWithCache(`/league/${leagueId}/matchups/${week}`).catch(() => []));
  }
  
  const allMatchups = await Promise.all(weekPromises);

  allMatchups.forEach((matchupsForWeek: any[], index: number) => {
    const week = index + 1;
    if (!matchupsForWeek || matchupsForWeek.length === 0) return;

    const matchupMap = new Map<number, any[]>();
    for (const match of matchupsForWeek) {
      if (!matchupMap.has(match.matchup_id)) {
        matchupMap.set(match.matchup_id, []);
      }
      matchupMap.get(match.matchup_id)!.push(match);
    }

    const parsedMatchups: ScheduleMatchup[] = [];
    
    for (const [matchupId, teams] of Array.from(matchupMap.entries())) {
      if (!matchupId || teams.length !== 2) continue; // Byes or weird playoff setups
      
      const t1 = teams[0];
      const t2 = teams[1];
      
      parsedMatchups.push({
        matchupId,
        teamA: getTeamInfo(t1.roster_id, (t1.points || 0) + (t1.custom_points || 0)),
        teamB: getTeamInfo(t2.roster_id, (t2.points || 0) + (t2.custom_points || 0)),
      });
    }

    if (parsedMatchups.length > 0) {
      schedule.push({
        week,
        isCompleted: week <= completedWeek,
        matchups: parsedMatchups
      });
    }
  });

  return schedule;
}

export async function getDraftReport(leagueId: string) {
  // Fetch drafts
  const drafts = await fetchWithCache(`/league/${leagueId}/drafts`).catch(() => []);
  if (!drafts || drafts.length === 0) return { steal: null, bust: null, managerGrades: [], biggestRegret: null, positionalReach: null, waiverHero: null, redraftBoard: [] };
  const draftId = drafts[0].draft_id;

  // Fetch picks, users, rosters
  const [picks, users, rosters, nflState] = await Promise.all([
    fetchWithCache(`/draft/${draftId}/picks`).catch(() => []),
    getUsers(leagueId),
    getRosters(leagueId),
    fetchWithCache('https://api.sleeper.app/v1/state/nfl').catch(() => ({ leg: 1, season_type: 'regular' }))
  ]);
  const completedWeek = getCompletedWeek(nflState);
  
  if (!picks || picks.length === 0) return { steal: null, bust: null, managerGrades: [], biggestRegret: null, positionalReach: null, waiverHero: null, redraftBoard: [] };

  const userMap = new Map();
  for (const u of users) userMap.set(u.user_id, u);

  // Fetch all matchups to get player points
  const weekPromises = [];
  for (let week = 1; week <= 18; week++) {
    weekPromises.push(fetchWithCache(`/league/${leagueId}/matchups/${week}`).catch(() => []));
  }
  const allMatchups = await Promise.all(weekPromises);

  const playerPoints = new Map<string, number>();
  
  allMatchups.forEach((matchupsForWeek: any, index: number) => {
    const week = index + 1;
    if (week > completedWeek || !matchupsForWeek) return;
    
    for (const match of matchupsForWeek) {
      if (match.players_points) {
        for (const [playerId, points] of Object.entries(match.players_points)) {
          const current = playerPoints.get(playerId) || 0;
          playerPoints.set(playerId, current + (points as number));
        }
      }
    }
  });

  const parsedPicks = picks.map((p: any) => {
    const totalPoints = playerPoints.get(p.player_id) || 0;
    const user = userMap.get(p.picked_by);
    return {
      pickNo: p.pick_no,
      round: p.round,
      playerId: p.player_id,
      playerName: `${p.metadata.first_name} ${p.metadata.last_name}`,
      position: p.metadata.position,
      team: p.metadata.team || 'FA',
      rosterId: p.roster_id,
      pickedBy: user?.display_name || 'Unknown',
      totalPoints,
      valueScore: totalPoints * (p.pick_no / 10) // Normalize pick no multiplier
    };
  });

  // Original Steal and Bust
  const premiumPicks = parsedPicks.filter((p: any) => p.round <= 3 && p.position !== 'DEF' && p.position !== 'K');
  const bust = premiumPicks.length > 0 ? premiumPicks.reduce((prev: any, current: any) => (prev.totalPoints < current.totalPoints) ? prev : current) : null;

  const latePicks = parsedPicks.filter((p: any) => p.round >= 8 && p.position !== 'DEF' && p.position !== 'K' && p.totalPoints > 20);
  const steal = latePicks.length > 0 ? latePicks.reduce((prev: any, current: any) => (prev.valueScore > current.valueScore) ? prev : current) : null;

  // 1. Manager Draft Grades
  const roundAverages = new Map<number, number>();
  const roundCounts = new Map<number, number>();
  for (const p of parsedPicks) {
    if (p.totalPoints > 0) {
       roundAverages.set(p.round, (roundAverages.get(p.round) || 0) + p.totalPoints);
       roundCounts.set(p.round, (roundCounts.get(p.round) || 0) + 1);
    }
  }
  for (const [round, total] of roundAverages.entries()) {
    roundAverages.set(round, total / (roundCounts.get(round) || 1));
  }

  const managerStats = new Map();
  for (const p of parsedPicks) {
    if (!managerStats.has(p.pickedBy)) {
       managerStats.set(p.pickedBy, { managerName: p.pickedBy, avatarUrl: null, totalPoints: 0, expectedPoints: 0 });
    }
    const stats = managerStats.get(p.pickedBy);
    stats.totalPoints += p.totalPoints;
    stats.expectedPoints += (roundAverages.get(p.round) || 0);
  }

  const managerGrades = Array.from(managerStats.values()).map(s => {
    s.valueOverExpected = s.totalPoints - s.expectedPoints;
    const user = users.find((u: any) => u.display_name === s.managerName);
    s.avatarUrl = user?.avatar ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : null;
    return s;
  }).sort((a, b) => b.valueOverExpected - a.valueOverExpected);

  const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'D-', 'F'];
  managerGrades.forEach((m, i) => {
    m.grade = grades[Math.floor((i / managerGrades.length) * grades.length)] || 'F';
  });

  // 2. Biggest Regret
  let biggestRegret = null;
  let maxRegretDiff = 0;
  for (let i = 0; i < parsedPicks.length - 1; i++) {
    const drafted = parsedPicks[i];
    for (let j = i + 1; j < Math.min(i + 6, parsedPicks.length); j++) {
       const passed = parsedPicks[j];
       if (passed.totalPoints - drafted.totalPoints > maxRegretDiff) {
         maxRegretDiff = passed.totalPoints - drafted.totalPoints;
         const user = users.find((u: any) => u.display_name === drafted.pickedBy);
         biggestRegret = { 
           managerName: drafted.pickedBy, 
           avatarUrl: user?.avatar ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : null,
           draftedPlayer: drafted, 
           passedPlayer: passed, 
           pointDiff: maxRegretDiff 
         };
       }
    }
  }

  // 3. Positional Reach
  let positionalReach = null;
  let maxReachDiff = 0;
  for (let i = 0; i < parsedPicks.length - 1; i++) {
    const drafted = parsedPicks[i];
    if (drafted.round <= 4 && (drafted.position === 'QB' || drafted.position === 'TE')) {
       let bestPassed = null;
       for (let j = i + 1; j < Math.min(i + 13, parsedPicks.length); j++) {
          const passed = parsedPicks[j];
          if (passed.position === 'WR' || passed.position === 'RB') {
             if (!bestPassed || passed.totalPoints > bestPassed.totalPoints) {
                bestPassed = passed;
             }
          }
       }
       if (bestPassed && bestPassed.totalPoints - drafted.totalPoints > maxReachDiff) {
          maxReachDiff = bestPassed.totalPoints - drafted.totalPoints;
          const user = users.find((u: any) => u.display_name === drafted.pickedBy);
          positionalReach = { 
            managerName: drafted.pickedBy, 
            avatarUrl: user?.avatar ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : null,
            reachPlayer: drafted, 
            passedPlayer: bestPassed, 
            pointDiff: maxReachDiff 
          };
       }
    }
  }

  // 4. Waiver Hero
  let waiverHero = null;
  let maxWaiverPoints = 0;
  const allDraftedPlayers = new Map<string, any>(parsedPicks.map((p: any) => [p.playerId, p]));

  for (const roster of rosters) {
    if (!roster.owner_id) continue;
    const manager = userMap.get(roster.owner_id);
    if (!manager) continue;
    
    const draftedPlayerIds = new Set(parsedPicks.filter((p: any) => p.pickedBy === manager.display_name).map((p: any) => p.playerId));
    
    for (const playerId of roster.players || []) {
       if (!draftedPlayerIds.has(playerId)) {
          const points = playerPoints.get(playerId) || 0;
          if (points > maxWaiverPoints) {
             const draftedInfo = allDraftedPlayers.get(playerId);
             if (draftedInfo) { // Only count if they were drafted by someone else (we know their name)
               maxWaiverPoints = points;
               waiverHero = {
                 managerName: manager.display_name,
                 avatarUrl: manager.avatar ? `https://sleepercdn.com/avatars/thumbs/${manager.avatar}` : null,
                 playerId,
                 playerName: draftedInfo.playerName,
                 position: draftedInfo.position,
                 team: draftedInfo.team,
                 totalPoints: points
               };
             }
          }
       }
    }
  }

  // 5. Redraft Board
  const redraftBoard = [...parsedPicks].sort((a: any, b: any) => b.totalPoints - a.totalPoints).slice(0, 12).map((p: any, idx: number) => ({
    actualPickNo: p.pickNo,
    shouldHaveGone: idx + 1,
    playerId: p.playerId,
    playerName: p.playerName,
    position: p.position,
    team: p.team,
    totalPoints: p.totalPoints,
    draftedBy: p.pickedBy
  }));

  return { steal, bust, managerGrades, biggestRegret, positionalReach, waiverHero, redraftBoard };
}

export async function getAllTimeMatchups(currentLeagueId: string) {
  const allMatchups = [];
  let leagueIdToFetch: string | null = currentLeagueId;
  const nflState = await fetchWithCache('https://api.sleeper.app/v1/state/nfl').catch(() => ({ leg: 1, season_type: 'regular', season: '2026' }));
  const completedWeek = getCompletedWeek(nflState);

  while (leagueIdToFetch) {
    const leagueData = await fetchWithCache(`/league/${leagueIdToFetch}`);
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
        avatarUrl: u.avatar ? `https://sleepercdn.com/avatars/thumbs/${u.avatar}` : null
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
        fetchWithCache(`/league/${leagueData.league_id}/matchups/${week}`)
          .catch(() => [])
          .then(data => ({ week, data }))
      );
    }
    const weeklyData = await Promise.all(weekPromises);

    for (const { week, data } of weeklyData) {
      if (!data || data.length === 0) continue;
      if (season === nflState.season && week > completedWeek) continue;

      // Group by matchup_id
      const matchupPairs = new Map<number, any[]>();
      for (const m of data) {
        if (!m.matchup_id) continue;
        if (!matchupPairs.has(m.matchup_id)) matchupPairs.set(m.matchup_id, []);
        matchupPairs.get(m.matchup_id)!.push(m);
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
