import { TeamStats } from '@/types/sleeper';

export interface AllPlayResult {
  team: TeamStats;
  wins: number;
  losses: number;
  ties: number;
  winPercentage: number;
}

export function calculateAllPlayRecord(teams: TeamStats[]): AllPlayResult[] {
  const results = teams.map(t => ({ team: t, wins: 0, losses: 0, ties: 0, winPercentage: 0 }));
  
  // Find weeks that have been played (max points > 0)
  const allWeeks = Object.keys(teams[0]?.weeklyScores || {}).map(Number);
  const playedWeeks = allWeeks.filter(w => {
    const maxScore = Math.max(...teams.map(t => t.weeklyScores[w] || 0));
    return maxScore > 0;
  });

  for (const week of playedWeeks) {
    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < teams.length; j++) {
        if (i === j) continue; // Don't play yourself
        const teamA = teams[i];
        const teamB = teams[j];
        
        const scoreA = teamA.weeklyScores[week] || 0;
        const scoreB = teamB.weeklyScores[week] || 0;
        
        if (scoreA > scoreB) results[i].wins++;
        else if (scoreA < scoreB) results[i].losses++;
        else results[i].ties++;
      }
    }
  }

  // Calculate percentage and sort
  results.forEach(r => {
    const totalGames = r.wins + r.losses + r.ties;
    r.winPercentage = totalGames > 0 ? (r.wins + (r.ties * 0.5)) / totalGames : 0;
  });

  results.sort((a, b) => b.winPercentage - a.winPercentage || b.team.fpts - a.team.fpts);
  
  return results;
}

export interface ScheduleSwapperResult {
  actualWins: number;
  actualLosses: number;
  actualTies: number;
  swappedWins: number;
  swappedLosses: number;
  swappedTies: number;
  weeklyResults: {
    week: number;
    myScore: number;
    opponentId: number | null;
    opponentScore: number;
    won: boolean;
  }[];
}

export function calculateScheduleSwapper(teamId: number, targetScheduleId: number, teams: TeamStats[]): ScheduleSwapperResult | null {
  const team = teams.find(t => t.rosterId === teamId);
  const targetTeam = teams.find(t => t.rosterId === targetScheduleId);
  
  if (!team || !targetTeam) return null;

  let swappedWins = 0;
  let swappedLosses = 0;
  let swappedTies = 0;
  const weeklyResults = [];

  const allWeeks = Object.keys(team.weeklyScores).map(Number);
  const playedWeeks = allWeeks.filter(w => {
    const maxScore = Math.max(...teams.map(t => t.weeklyScores[w] || 0));
    return maxScore > 0;
  });

  for (const week of playedWeeks) {
    const myScore = team.weeklyScores[week] || 0;
    // Target team's opponent that week
    const targetOpponentId = targetTeam.weeklyOpponentRosterIds[week];
    
    // If the target's opponent was ME, then I play the TARGET TEAM
    let opponentId = targetOpponentId;
    if (opponentId === teamId) {
      opponentId = targetScheduleId;
    }
    
    const opponentTeam = opponentId ? teams.find(t => t.rosterId === opponentId) : null;
    const opponentScore = opponentTeam ? (opponentTeam.weeklyScores[week] || 0) : 0;

    let won = false;
    if (opponentTeam) {
        if (myScore > opponentScore) {
          swappedWins++;
          won = true;
        } else if (myScore < opponentScore) {
          swappedLosses++;
        } else {
          swappedTies++;
        }
    }

    weeklyResults.push({
      week,
      myScore,
      opponentId,
      opponentScore,
      won
    });
  }

  return {
    actualWins: team.wins,
    actualLosses: team.losses,
    actualTies: team.ties,
    swappedWins,
    swappedLosses,
    swappedTies,
    weeklyResults
  };
}

export interface BadgeResult {
  team: TeamStats;
  reason: string;
}

export interface Badges {
  benchWhisperer: BadgeResult | null;
  cardiacKid: BadgeResult | null;
  glassCannon: BadgeResult | null;
  unlucky: BadgeResult | null;
  tinkerer: BadgeResult | null;
  participationTrophy: BadgeResult | null;
  backpack: BadgeResult | null;
  churnAndBurn: BadgeResult | null;
  bestBallChampion: BadgeResult | null;
  oneHitWonder: BadgeResult | null;
  hyroxMoment: BadgeResult | null;
}

export function calculateBadges(teams: TeamStats[]): Badges {
  if (teams.length === 0) return { 
    benchWhisperer: null, 
    cardiacKid: null, 
    glassCannon: null, 
    unlucky: null,
    tinkerer: null,
    participationTrophy: null,
    backpack: null,
    churnAndBurn: null,
    bestBallChampion: null,
    oneHitWonder: null,
    hyroxMoment: null
  };

  const playedWeeks = Object.keys(teams[0]?.weeklyScores || {}).map(Number).filter(w => {
    return Math.max(...teams.map(t => t.weeklyScores[w] || 0)) > 0;
  });

  let benchWhisperer = teams[0];
  let maxBench = -1;

  let cardiacKid = teams[0];
  let minMargin = Infinity;

  let glassCannon = teams[0];
  let maxStdDev = -1;

  let unlucky = teams[0];
  let maxFptsAgainst = -1;

  let tinkerer: TeamStats | null = null;
  let maxTinkererGap = 0;

  let backpack: TeamStats | null = null;
  let maxBackpack = 0;

  let churnAndBurn: TeamStats | null = null;
  let maxMoves = 0;

  let bestBallChampion = teams[0];
  let maxPpts = -1;

  let oneHitWonder: TeamStats | null = null;
  let maxOneHitWonderDelta = 0;
  let oneHitWonderMax = 0;
  let oneHitWonderAvg = 0;

  for (const team of teams) {
    // Bench Whisperer
    const totalBench = Object.values(team.weeklyBenchPoints).reduce((a, b) => a + b, 0);
    if (totalBench > maxBench && totalBench > 0) {
      maxBench = totalBench;
      benchWhisperer = team;
    }

    // Unlucky
    if (team.fptsAgainst > maxFptsAgainst) {
      maxFptsAgainst = team.fptsAgainst;
      unlucky = team;
    }

    // Tinkerer
    // ppts might be 0 if the week hasn't rolled over. Only calculate if ppts > fpts.
    const gap = team.ppts - team.fpts;
    if (team.ppts > 0 && gap > maxTinkererGap) {
      maxTinkererGap = gap;
      tinkerer = team;
    }

    // Backpack
    if (team.maxPlayerPercentage > maxBackpack && team.maxPlayerPercentage > 0) {
      maxBackpack = team.maxPlayerPercentage;
      backpack = team;
    }

    // Churn and Burn
    if (team.totalMoves > maxMoves && team.totalMoves > 0) {
      maxMoves = team.totalMoves;
      churnAndBurn = team;
    }

    // Best Ball Champion
    if (team.ppts > maxPpts) {
      maxPpts = team.ppts;
      bestBallChampion = team;
    }

    // Cardiac Kid
    let totalMargin = 0;
    let gamesPlayed = 0;
    for (const week of playedWeeks) {
      const oppId = team.weeklyOpponentRosterIds[week];
      if (oppId) {
        const oppTeam = teams.find(t => t.rosterId === oppId);
        if (oppTeam) {
           const margin = Math.abs((team.weeklyScores[week] || 0) - (oppTeam.weeklyScores[week] || 0));
           totalMargin += margin;
           gamesPlayed++;
        }
      }
    }
    const avgMargin = gamesPlayed > 0 ? totalMargin / gamesPlayed : Infinity;
    if (avgMargin < minMargin && gamesPlayed > 0) {
      minMargin = avgMargin;
      cardiacKid = team;
    }

    // Glass Cannon (Standard Deviation)
    const scores = playedWeeks.map(w => team.weeklyScores[w] || 0);
    if (scores.length > 1) { // Need at least 2 weeks for volatility to make sense
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
      const stdDev = Math.sqrt(variance);
      
      if (stdDev > maxStdDev) {
        maxStdDev = stdDev;
        glassCannon = team;
      }
      
      // One-Hit Wonder
      const maxScore = Math.max(...scores);
      const delta = maxScore - mean;
      if (delta > maxOneHitWonderDelta) {
        maxOneHitWonderDelta = delta;
        oneHitWonder = team;
        oneHitWonderMax = maxScore;
        oneHitWonderAvg = mean;
      }
    }
  }

  // Participation Trophy (won with lowest score)
  let participationTrophy: TeamStats | null = null;
  let lowestWinningScore = Infinity;
  let participationOpponent = "";

  let hyroxMoment: TeamStats | null = null;
  let hyroxMaxBenchWin = -1;
  let hyroxOpponent = "";

  for (const week of playedWeeks) {
    for (const team of teams) {
      const myScore = team.weeklyScores[week] || 0;
      const oppId = team.weeklyOpponentRosterIds[week];
      if (oppId) {
        const oppTeam = teams.find(t => t.rosterId === oppId);
        if (oppTeam) {
          const oppScore = oppTeam.weeklyScores[week] || 0;
          if (myScore > oppScore && myScore < lowestWinningScore) {
            lowestWinningScore = myScore;
            participationTrophy = team;
            participationOpponent = oppTeam.displayName;
          }

          // Hyrox Moment: Winning despite leaving the most points on the bench
          const benchPts = team.weeklyBenchPoints[week] || 0;
          if (myScore > oppScore && benchPts > hyroxMaxBenchWin) {
            hyroxMaxBenchWin = benchPts;
            hyroxMoment = team;
            hyroxOpponent = oppTeam.displayName;
          }
        }
      }
    }
  }

  return {
    benchWhisperer: benchWhisperer ? { team: benchWhisperer, reason: `${benchWhisperer.displayName} has left ${maxBench.toFixed(1)} total points on their bench this season.` } : null,
    cardiacKid: cardiacKid ? { team: cardiacKid, reason: `${cardiacKid.displayName} games are decided by an average of just ${minMargin.toFixed(1)} points.` } : null,
    glassCannon: glassCannon ? { team: glassCannon, reason: `${glassCannon.displayName} has the most volatile team with a scoring standard deviation of ${maxStdDev.toFixed(1)} points.` } : null,
    unlucky: unlucky ? { team: unlucky, reason: `${unlucky.displayName} has had ${maxFptsAgainst.toFixed(1)} points scored against them, the most in the league.` } : null,
    tinkerer: tinkerer ? { team: tinkerer, reason: `${tinkerer.displayName} has missed out on ${maxTinkererGap.toFixed(1)} points by making the wrong start/sit decisions.` } : null,
    participationTrophy: participationTrophy ? { team: participationTrophy, reason: `${participationTrophy.displayName} somehow won a game by scoring only ${lowestWinningScore.toFixed(1)} points against ${participationOpponent}.` } : null,
    backpack: backpack ? { team: backpack, reason: `${backpack.displayName} relies heavily on a single player who scored ${(maxBackpack * 100).toFixed(1)}% of their total points.` } : null,
    churnAndBurn: churnAndBurn ? { team: churnAndBurn, reason: `${churnAndBurn.displayName} has made ${maxMoves} roster moves (trades and waivers) so far.` } : null,
    bestBallChampion: bestBallChampion ? { team: bestBallChampion, reason: `${bestBallChampion.displayName} has the highest max potential points (${maxPpts.toFixed(1)}). They'd be unstoppable if they set the right lineup.` } : null,
    oneHitWonder: oneHitWonder ? { team: oneHitWonder, reason: `${oneHitWonder.displayName} had a massive week of ${oneHitWonderMax.toFixed(1)}, but averages a measly ${oneHitWonderAvg.toFixed(1)}.` } : null,
    hyroxMoment: hyroxMoment ? { team: hyroxMoment, reason: `${hyroxMoment.displayName} left ${hyroxMaxBenchWin.toFixed(1)} points on the bench and completely crapped the bed, but still beat ${hyroxOpponent}. A win is a win!` } : null
  };
}

export interface PowerRankingTeam {
  team: TeamStats;
  powerScore: number;
  rank: number;
  trueWinPct: number;
  recentForm: number;
}

export function calculatePowerRankings(teams: TeamStats[]): PowerRankingTeam[] {
  if (teams.length === 0) return [];
  
  const allPlay = calculateAllPlayRecord(teams);
  const playedWeeks = Object.keys(teams[0]?.weeklyScores || {}).map(Number).filter(w => {
    return Math.max(...teams.map(t => t.weeklyScores[w] || 0)) > 0;
  }).sort((a, b) => b - a);
  
  // Calculate max PF for normalization
  const maxPF = Math.max(...teams.map(t => t.fpts));
  
  return allPlay.map(ap => {
    // Recent form: average of last up to 3 weeks
    let recentForm = 0;
    const recentWeeks = playedWeeks.slice(0, 3);
    if (recentWeeks.length > 0) {
      const recentPoints = recentWeeks.reduce((acc, week) => acc + (ap.team.weeklyScores[week] || 0), 0);
      recentForm = recentPoints / recentWeeks.length;
    }

    const maxRecentForm = Math.max(...teams.map(t => {
      const pts = recentWeeks.reduce((acc, week) => acc + (t.weeklyScores[week] || 0), 0);
      return recentWeeks.length > 0 ? pts / recentWeeks.length : 0;
    }));

    // Normalize each metric (0 to 1)
    const normalizedWinPct = ap.winPercentage;
    const normalizedRecentForm = maxRecentForm > 0 ? recentForm / maxRecentForm : 0;
    const normalizedPF = maxPF > 0 ? ap.team.fpts / maxPF : 0;

    // Weighting: 40% True Win %, 40% Recent Form, 20% Total PF
    const powerScore = (normalizedWinPct * 40) + (normalizedRecentForm * 40) + (normalizedPF * 20);

    return {
      team: ap.team,
      powerScore,
      rank: 0,
      trueWinPct: ap.winPercentage,
      recentForm
    };
  }).sort((a, b) => b.powerScore - a.powerScore).map((t, index) => ({ ...t, rank: index + 1 }));
}

export function getRivalries(allTimeMatchups: import('@/types/sleeper').AllTimeMatchup[]): import('@/types/sleeper').Rivalry[] {
  const rivalries = new Map<string, import('@/types/sleeper').Rivalry>();

  for (const match of allTimeMatchups) {
    const userA = match.teamA;
    const userB = match.teamB;

    // Create unique key regardless of order
    const pairKey = userA.userId < userB.userId 
      ? `${userA.userId}-${userB.userId}` 
      : `${userB.userId}-${userA.userId}`;

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

  // Filter out rivalries with 0 matches
  return Array.from(rivalries.values()).filter(r => r.totalMatches > 0).sort((a, b) => {
    // Sort by largest sweep, then total matches
    const diffA = Math.abs(a.winsA - a.winsB);
    const diffB = Math.abs(b.winsA - b.winsB);
    return diffB - diffA || b.totalMatches - a.totalMatches;
  });
}


export function calculateAllTimeRecords(
  allTimeMatchups: import('@/types/sleeper').AllTimeMatchup[],
  history: import('@/types/sleeper').LeagueHistory[]
): import('@/types/sleeper').AllTimeRecords {
  const managerMap = new Map<string, {
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    seasons: Set<string>;
    wins: number;
    losses: number;
    ties: number;
    totalPoints: number;
    games: number;
    championships: string[];
    toiletBowls: string[];
  }>();

  const singleGames: import('@/types/sleeper').SingleGameRecord[] = [];
  const margins: import('@/types/sleeper').MatchupMarginRecord[] = [];

  const ensureManager = (user: { userId: string; displayName: string; avatarUrl: string | null }) => {
    if (!managerMap.has(user.userId)) {
      managerMap.set(user.userId, {
        userId: user.userId,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        seasons: new Set(),
        wins: 0,
        losses: 0,
        ties: 0,
        totalPoints: 0,
        games: 0,
        championships: [],
        toiletBowls: []
      });
    } else {
      const existing = managerMap.get(user.userId)!;
      if (user.avatarUrl) existing.avatarUrl = user.avatarUrl;
      if (user.displayName) existing.displayName = user.displayName;
    }
    return managerMap.get(user.userId)!;
  };

  for (const match of allTimeMatchups) {
    const { season, week, teamA, teamB } = match;
    if (teamA.points <= 0 && teamB.points <= 0) continue;

    const mA = ensureManager(teamA);
    const mB = ensureManager(teamB);

    mA.seasons.add(season);
    mB.seasons.add(season);

    mA.games++;
    mB.games++;
    mA.totalPoints += teamA.points;
    mB.totalPoints += teamB.points;

    const aWon = teamA.points > teamB.points;
    const bWon = teamB.points > teamA.points;

    if (aWon) {
      mA.wins++;
      mB.losses++;
    } else if (bWon) {
      mB.wins++;
      mA.losses++;
    } else {
      mA.ties++;
      mB.ties++;
    }

    singleGames.push({
      season,
      week,
      userId: teamA.userId,
      displayName: teamA.displayName,
      avatarUrl: teamA.avatarUrl,
      points: teamA.points,
      opponentName: teamB.displayName,
      opponentPoints: teamB.points,
      won: aWon
    });

    singleGames.push({
      season,
      week,
      userId: teamB.userId,
      displayName: teamB.displayName,
      avatarUrl: teamB.avatarUrl,
      points: teamB.points,
      opponentName: teamA.displayName,
      opponentPoints: teamA.points,
      won: bWon
    });

    if (teamA.points !== teamB.points) {
      const winner = aWon ? teamA : teamB;
      const loser = aWon ? teamB : teamA;
      margins.push({
        season,
        week,
        winnerName: winner.displayName,
        winnerAvatar: winner.avatarUrl,
        winnerPoints: winner.points,
        loserName: loser.displayName,
        loserAvatar: loser.avatarUrl,
        loserPoints: loser.points,
        margin: Math.abs(winner.points - loser.points)
      });
    }
  }

  for (const h of history) {
    if (h.winner) {
      const m = ensureManager(h.winner);
      m.seasons.add(h.year);
      if (!m.championships.includes(h.year)) m.championships.push(h.year);
    }
    if (h.loser) {
      const m = ensureManager(h.loser);
      m.seasons.add(h.year);
      if (!m.toiletBowls.includes(h.year)) m.toiletBowls.push(h.year);
    }
  }

  const leaderboard: import('@/types/sleeper').FranchiseStats[] = Array.from(managerMap.values())
    .filter(m => m.games > 0)
    .map(m => ({
      userId: m.userId,
      displayName: m.displayName,
      avatarUrl: m.avatarUrl,
      seasonsPlayed: m.seasons.size,
      wins: m.wins,
      losses: m.losses,
      ties: m.ties,
      winPct: m.games > 0 ? (m.wins + m.ties * 0.5) / m.games : 0,
      totalPoints: m.totalPoints,
      ppg: m.games > 0 ? m.totalPoints / m.games : 0,
      championships: m.championships.sort(),
      toiletBowls: m.toiletBowls.sort()
    }))
    .sort((a, b) => b.wins - a.wins || b.totalPoints - a.totalPoints);

  const highestScores = [...singleGames]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  const lowestScores = [...singleGames]
    .filter(g => g.points > 0)
    .sort((a, b) => a.points - b.points)
    .slice(0, 5);

  const closestGames = [...margins]
    .sort((a, b) => a.margin - b.margin)
    .slice(0, 5);

  const biggestBlowouts = [...margins]
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 5);

  return {
    leaderboard,
    highestScores,
    lowestScores,
    closestGames,
    biggestBlowouts
  };
}
