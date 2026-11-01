import { getUsers, getRosters, getMatchups, getTransactions } from '@/lib/sleeper-api';

export interface PlayerHighlight {
  playerId: string;
  name: string;
  position: string;
  team: string;
  points: number;
  isNamed: boolean;
}

export interface MatchupTelemetry {
  matchupId: number;
  teamA: string;
  teamAAvatar: string | null;
  teamARecord: string;
  scoreA: number;
  benchPointsA: number;
  mvpStarterA: PlayerHighlight | null;
  worstStarterA: PlayerHighlight | null;
  bestBenchA: PlayerHighlight | null;

  teamB: string;
  teamBAvatar: string | null;
  teamBRecord: string;
  scoreB: number;
  benchPointsB: number;
  mvpStarterB: PlayerHighlight | null;
  worstStarterB: PlayerHighlight | null;
  bestBenchB: PlayerHighlight | null;

  winner: string;
  loser: string;
  margin: number;
  whatIfFlip: string | null;
}

export interface TeamStandingTelemetry {
  rosterId: number;
  team: string;
  avatarUrl: string | null;
  wins: number;
  losses: number;
  ties: number;
  record: string;
  fpts: number;
  fptsAgainst: number;
  weekScore: number;
  weekBenchPoints: number;
  allPlayWins: number;
  allPlayLosses: number;
  allPlayRecord: string;
  streak: string;
  standingsRank: number;
  prevStandingsRank: number;
  rankDelta: number;
  tier: 'contender' | 'playoff' | 'bubble' | 'basement';
}

export interface TransactionTelemetry {
  id: string;
  type: 'waiver' | 'free_agent' | 'trade';
  managers: string[];
  faabBid: number;
  added: PlayerHighlight[];
  dropped: PlayerHighlight[];
  summary: string;
}

export interface NextWeekMatchupPreview {
  matchupId: number;
  teamA: string;
  teamAAvatar: string | null;
  teamARecord: string;
  teamAFpts: number;
  teamB: string;
  teamBAvatar: string | null;
  teamBRecord: string;
  teamBFpts: number;
}

export interface NewsletterMeta {
  week: number;
  generatedAt: string;
  pulse: {
    highestScorer: { team: string; avatarUrl: string | null; points: number; opponent: string };
    lowestScorer: { team: string; avatarUrl: string | null; points: number; opponent: string };
    biggestBlowout: {
      winner: string;
      winnerAvatar: string | null;
      loser: string;
      loserAvatar: string | null;
      winnerPoints: number;
      loserPoints: number;
      margin: number;
    };
    closestGame: {
      winner: string;
      winnerAvatar: string | null;
      loser: string;
      loserAvatar: string | null;
      winnerPoints: number;
      loserPoints: number;
      margin: number;
    };
    benchKing: {
      team: string;
      avatarUrl: string | null;
      benchPoints: number;
      topBenchPlayer: PlayerHighlight | null;
    };
  };
  matchups: MatchupTelemetry[];
  standings: TeamStandingTelemetry[];
  transactions: TransactionTelemetry[];
  nextWeekMatchups: NextWeekMatchupPreview[];
}

const NFL_TEAM_NAMES: Record<string, string> = {
  ARI: 'Cardinals DEF',
  ATL: 'Falcons DEF',
  BAL: 'Ravens DEF',
  BUF: 'Bills DEF',
  CAR: 'Panthers DEF',
  CHI: 'Bears DEF',
  CIN: 'Bengals DEF',
  CLE: 'Browns DEF',
  DAL: 'Cowboys DEF',
  DEN: 'Broncos DEF',
  DET: 'Lions DEF',
  GB: 'Packers DEF',
  HOU: 'Texans DEF',
  IND: 'Colts DEF',
  JAX: 'Jaguars DEF',
  KC: 'Chiefs DEF',
  LAC: 'Chargers DEF',
  LAR: 'Rams DEF',
  LV: 'Raiders DEF',
  MIA: 'Dolphins DEF',
  MIN: 'Vikings DEF',
  NE: 'Patriots DEF',
  NO: 'Saints DEF',
  NYG: 'Giants DEF',
  NYJ: 'Jets DEF',
  PHI: 'Eagles DEF',
  PIT: 'Steelers DEF',
  SEA: 'Seahawks DEF',
  SF: '49ers DEF',
  TB: 'Buccaneers DEF',
  TEN: 'Titans DEF',
  WAS: 'Commanders DEF',
};

async function fetchDraftPlayerMap(
  leagueId: string
): Promise<Map<string, { name: string; position: string; team: string }>> {
  const map = new Map<string, { name: string; position: string; team: string }>();

  for (const [abbr, defName] of Object.entries(NFL_TEAM_NAMES)) {
    map.set(abbr, { name: defName, position: 'DEF', team: abbr });
  }

  try {
    let currentId: string | null = leagueId;
    let depth = 0;
    while (currentId && depth < 3) {
      depth++;
      const [leagueRes, draftsRes]: [Response, Response] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${currentId}`),
        fetch(`https://api.sleeper.app/v1/league/${currentId}/drafts`),
      ]);

      if (draftsRes.ok) {
        const drafts = await draftsRes.json();
        if (Array.isArray(drafts) && drafts.length > 0 && drafts[0]?.draft_id) {
          const picksRes = await fetch(
            `https://api.sleeper.app/v1/draft/${drafts[0].draft_id}/picks`
          );
          if (picksRes.ok) {
            const picks = await picksRes.json();
            if (Array.isArray(picks)) {
              for (const p of picks) {
                if (p?.player_id && p?.metadata && !map.has(String(p.player_id))) {
                  const first = p.metadata.first_name || '';
                  const last = p.metadata.last_name || '';
                  const fullName = `${first} ${last}`.trim();
                  if (fullName) {
                    map.set(String(p.player_id), {
                      name: fullName,
                      position: p.metadata.position || 'FLEX',
                      team: p.metadata.team || 'FA',
                    });
                  }
                }
              }
            }
          }
        }
      }

      if (leagueRes.ok) {
        const leagueJson = await leagueRes.json();
        currentId = leagueJson?.previous_league_id || null;
      } else {
        currentId = null;
      }
    }
  } catch {
    // Ignore draft fetch failures; fallback gracefully
  }

  return map;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export async function buildWeeklyNewsletterTelemetry(
  leagueId: string,
  week: number
): Promise<NewsletterMeta> {
  const maxWeekToFetch = Math.min(18, Math.max(1, week + 1));
  const weekIndices = Array.from({ length: maxWeekToFetch }, (_, i) => i + 1);

  const [users, rosters, playerDir, transactions, ...allMatchupsByWeek] = await Promise.all([
    getUsers(leagueId),
    getRosters(leagueId),
    fetchDraftPlayerMap(leagueId),
    getTransactions(leagueId, week).catch(() => []),
    ...weekIndices.map((w) => getMatchups(leagueId, w).catch(() => [])),
  ]);

  const userMap = new Map<string, { displayName: string; avatarUrl: string | null }>();
  for (const u of users) {
    userMap.set(u.user_id, {
      displayName: u.display_name,
      avatarUrl: u.avatar ? `https://sleepercdn.com/avatars/thumbs/${u.avatar}` : null,
    });
  }

  const rosterInfoMap = new Map<
    number,
    { rosterId: number; displayName: string; avatarUrl: string | null }
  >();
  for (const r of rosters) {
    const owner = r.owner_id ? userMap.get(r.owner_id) : null;
    rosterInfoMap.set(r.roster_id, {
      rosterId: r.roster_id,
      displayName: owner?.displayName || `Team ${r.roster_id}`,
      avatarUrl: owner?.avatarUrl || null,
    });
  }

  const resolvePlayer = (playerId: string, points: number): PlayerHighlight => {
    const known = playerDir.get(String(playerId));
    if (known) {
      return {
        playerId: String(playerId),
        name: known.name,
        position: known.position,
        team: known.team,
        points: round2(points),
        isNamed: true,
      };
    }
    if (/^[A-Z]{2,3}$/.test(String(playerId))) {
      return {
        playerId: String(playerId),
        name: `${playerId} DEF`,
        position: 'DEF',
        team: String(playerId),
        points: round2(points),
        isNamed: true,
      };
    }
    return {
      playerId: String(playerId),
      name: 'Waiver Free Agent',
      position: 'FLEX',
      team: 'NFL',
      points: round2(points),
      isNamed: false,
    };
  };

  // Helper to compute standings through targetWeek
  const computeStandingsThrough = (targetWeek: number) => {
    const stats = new Map<
      number,
      {
        rosterId: number;
        wins: number;
        losses: number;
        ties: number;
        fpts: number;
        fptsAgainst: number;
        allPlayWins: number;
        allPlayLosses: number;
        results: ('W' | 'L' | 'T')[];
        weekScore: number;
        weekBenchPoints: number;
      }
    >();

    for (const r of rosters) {
      stats.set(r.roster_id, {
        rosterId: r.roster_id,
        wins: 0,
        losses: 0,
        ties: 0,
        fpts: 0,
        fptsAgainst: 0,
        allPlayWins: 0,
        allPlayLosses: 0,
        results: [],
        weekScore: 0,
        weekBenchPoints: 0,
      });
    }

    for (let w = 1; w <= targetWeek; w++) {
      const weekMatchups = (allMatchupsByWeek[w - 1] || []) as any[];
      if (!weekMatchups.length) continue;

      const byMatchupId = new Map<number, any[]>();
      const weeklyScoresList: { rosterId: number; score: number }[] = [];

      for (const m of weekMatchups) {
        const score = round2((m.points || 0) + (m.custom_points || 0));
        weeklyScoresList.push({ rosterId: m.roster_id, score });

        if (m.matchup_id) {
          if (!byMatchupId.has(m.matchup_id)) byMatchupId.set(m.matchup_id, []);
          byMatchupId.get(m.matchup_id)!.push({ ...m, totalScore: score });
        }

        if (w === targetWeek) {
          const st = stats.get(m.roster_id);
          if (st) {
            st.weekScore = score;
            if (m.players_points && m.starters_points) {
              const allPts = Object.values(m.players_points as Record<string, number>).reduce(
                (acc, v) => acc + (Number(v) || 0),
                0
              );
              const startPts = (m.starters_points as number[]).reduce(
                (acc, v) => acc + (Number(v) || 0),
                0
              );
              st.weekBenchPoints = round2(Math.max(0, allPts - startPts));
            }
          }
        }
      }

      // Check if week was actually played (at least some points > 0)
      const totalWeekPoints = weeklyScoresList.reduce((acc, item) => acc + item.score, 0);
      if (totalWeekPoints === 0) continue;

      // All-Play calculation for week w
      for (const itemA of weeklyScoresList) {
        const stA = stats.get(itemA.rosterId);
        if (!stA) continue;
        for (const itemB of weeklyScoresList) {
          if (itemA.rosterId === itemB.rosterId) continue;
          if (itemA.score > itemB.score) stA.allPlayWins++;
          else if (itemA.score < itemB.score) stA.allPlayLosses++;
        }
      }

      // Head-to-head calculation for week w
      for (const pair of byMatchupId.values()) {
        if (pair.length !== 2) continue;
        const [a, b] = pair;
        const stA = stats.get(a.roster_id);
        const stB = stats.get(b.roster_id);
        if (!stA || !stB) continue;

        stA.fpts = round2(stA.fpts + a.totalScore);
        stA.fptsAgainst = round2(stA.fptsAgainst + b.totalScore);
        stB.fpts = round2(stB.fpts + b.totalScore);
        stB.fptsAgainst = round2(stB.fptsAgainst + a.totalScore);

        if (a.totalScore > b.totalScore) {
          stA.wins++;
          stA.results.push('W');
          stB.losses++;
          stB.results.push('L');
        } else if (b.totalScore > a.totalScore) {
          stB.wins++;
          stB.results.push('W');
          stA.losses++;
          stA.results.push('L');
        } else {
          stA.ties++;
          stA.results.push('T');
          stB.ties++;
          stB.results.push('T');
        }
      }
    }

    const sorted = Array.from(stats.values()).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.fpts - a.fpts;
    });

    const rankMap = new Map<number, number>();
    sorted.forEach((item, idx) => rankMap.set(item.rosterId, idx + 1));

    return { stats, sorted, rankMap };
  };

  const currentStandingsData = computeStandingsThrough(week);
  const prevStandingsData = week > 1 ? computeStandingsThrough(week - 1) : currentStandingsData;

  const totalTeams = rosters.length || 12;

  const standings: TeamStandingTelemetry[] = currentStandingsData.sorted.map((st, idx) => {
    const info = rosterInfoMap.get(st.rosterId);
    const currentRank = idx + 1;
    const prevRank = prevStandingsData.rankMap.get(st.rosterId) || currentRank;
    const rankDelta = week > 1 ? prevRank - currentRank : 0;

    // Compute active streak
    let streak = '—';
    if (st.results.length > 0) {
      const last = st.results[st.results.length - 1];
      let count = 0;
      for (let i = st.results.length - 1; i >= 0; i--) {
        if (st.results[i] === last) count++;
        else break;
      }
      streak = `${last}${count}`;
    }

    const tier: TeamStandingTelemetry['tier'] =
      currentRank <= Math.ceil(totalTeams * 0.25)
        ? 'contender'
        : currentRank <= Math.ceil(totalTeams * 0.5)
        ? 'playoff'
        : currentRank <= Math.ceil(totalTeams * 0.75)
        ? 'bubble'
        : 'basement';

    const record =
      st.ties > 0 ? `${st.wins}-${st.losses}-${st.ties}` : `${st.wins}-${st.losses}`;

    return {
      rosterId: st.rosterId,
      team: info?.displayName || `Team ${st.rosterId}`,
      avatarUrl: info?.avatarUrl || null,
      wins: st.wins,
      losses: st.losses,
      ties: st.ties,
      record,
      fpts: round2(st.fpts),
      fptsAgainst: round2(st.fptsAgainst),
      weekScore: round2(st.weekScore),
      weekBenchPoints: round2(st.weekBenchPoints),
      allPlayWins: st.allPlayWins,
      allPlayLosses: st.allPlayLosses,
      allPlayRecord: `${st.allPlayWins}-${st.allPlayLosses}`,
      streak,
      standingsRank: currentRank,
      prevStandingsRank: prevRank,
      rankDelta,
      tier,
    };
  });

  const standingByRosterId = new Map<number, TeamStandingTelemetry>();
  for (const s of standings) standingByRosterId.set(s.rosterId, s);

  // Extract lineup breakdown for a single matchup entry
  const analyzeLineup = (matchEntry: any) => {
    const playersPoints: Record<string, number> = matchEntry.players_points || {};
    const startersList: string[] = Array.isArray(matchEntry.starters)
      ? matchEntry.starters.map(String)
      : [];
    const startersSet = new Set(startersList);

    const startersHighlights: PlayerHighlight[] = [];
    const benchHighlights: PlayerHighlight[] = [];

    if (startersList.length > 0 && Object.keys(playersPoints).length > 0) {
      for (const [pid, pts] of Object.entries(playersPoints)) {
        if (pid === '0') continue;
        const resolved = resolvePlayer(pid, Number(pts) || 0);
        if (startersSet.has(String(pid))) {
          startersHighlights.push(resolved);
        } else {
          benchHighlights.push(resolved);
        }
      }
    }

    // Prefer named players when selecting highlights if possible
    const sortDesc = (a: PlayerHighlight, b: PlayerHighlight) =>
      b.points - a.points || (b.isNamed ? 1 : 0) - (a.isNamed ? 1 : 0);
    const sortAsc = (a: PlayerHighlight, b: PlayerHighlight) =>
      a.points - b.points || (b.isNamed ? 1 : 0) - (a.isNamed ? 1 : 0);

    const mvpStarter = [...startersHighlights].sort(sortDesc)[0] || null;
    const worstStarter = [...startersHighlights].sort(sortAsc)[0] || null;
    const bestBench = [...benchHighlights].sort(sortDesc)[0] || null;

    let benchPoints = 0;
    if (matchEntry.players_points && matchEntry.starters_points) {
      const allPts = Object.values(playersPoints).reduce((acc, v) => acc + (Number(v) || 0), 0);
      const startPts = (matchEntry.starters_points as number[]).reduce(
        (acc, v) => acc + (Number(v) || 0),
        0
      );
      benchPoints = round2(Math.max(0, allPts - startPts));
    }

    return {
      benchPoints,
      mvpStarter,
      worstStarter,
      bestBench,
    };
  };

  // Week N Matchups
  const targetWeekRaw = (allMatchupsByWeek[week - 1] || []) as any[];
  const matchupGroups = new Map<number, any[]>();
  for (const m of targetWeekRaw) {
    if (!m.matchup_id) continue;
    if (!matchupGroups.has(m.matchup_id)) matchupGroups.set(m.matchup_id, []);
    matchupGroups.get(m.matchup_id)!.push(m);
  }

  const matchups: MatchupTelemetry[] = [];
  let highestScorer = {
    team: 'N/A',
    avatarUrl: null as string | null,
    points: -1,
    opponent: 'N/A',
  };
  let lowestScorer = {
    team: 'N/A',
    avatarUrl: null as string | null,
    points: 99999,
    opponent: 'N/A',
  };
  let biggestBlowout = {
    winner: 'N/A',
    winnerAvatar: null as string | null,
    loser: 'N/A',
    loserAvatar: null as string | null,
    winnerPoints: 0,
    loserPoints: 0,
    margin: -1,
  };
  let closestGame = {
    winner: 'N/A',
    winnerAvatar: null as string | null,
    loser: 'N/A',
    loserAvatar: null as string | null,
    winnerPoints: 0,
    loserPoints: 0,
    margin: 99999,
  };
  let benchKing = {
    team: 'N/A',
    avatarUrl: null as string | null,
    benchPoints: -1,
    topBenchPlayer: null as PlayerHighlight | null,
  };

  // Also map every playerId -> points scored in Week N for transaction grading
  const weekPlayerPoints = new Map<string, number>();
  for (const m of targetWeekRaw) {
    if (m.players_points) {
      for (const [pid, pts] of Object.entries(m.players_points as Record<string, number>)) {
        weekPlayerPoints.set(String(pid), round2(Number(pts) || 0));
      }
    }
  }

  for (const [matchupId, pair] of Array.from(matchupGroups.entries())) {
    if (pair.length !== 2) continue;
    const [m1, m2] = pair;

    const infoA = rosterInfoMap.get(m1.roster_id);
    const infoB = rosterInfoMap.get(m2.roster_id);
    const standA = standingByRosterId.get(m1.rosterId || m1.roster_id);
    const standB = standingByRosterId.get(m2.rosterId || m2.roster_id);

    const teamA = infoA?.displayName || `Team ${m1.roster_id}`;
    const teamB = infoB?.displayName || `Team ${m2.roster_id}`;
    const scoreA = round2((m1.points || 0) + (m1.custom_points || 0));
    const scoreB = round2((m2.points || 0) + (m2.custom_points || 0));

    const lineupA = analyzeLineup(m1);
    const lineupB = analyzeLineup(m2);

    const aWon = scoreA >= scoreB;
    const winner = aWon ? teamA : teamB;
    const loser = aWon ? teamB : teamA;
    const winnerAvatar = aWon ? infoA?.avatarUrl || null : infoB?.avatarUrl || null;
    const loserAvatar = aWon ? infoB?.avatarUrl || null : infoA?.avatarUrl || null;
    const winnerPoints = aWon ? scoreA : scoreB;
    const loserPoints = aWon ? scoreB : scoreA;
    const margin = round2(Math.abs(scoreA - scoreB));

    // Check if the loser could have flipped the matchup with 1 bench swap
    const loserLineup = aWon ? lineupB : lineupA;
    let whatIfFlip: string | null = null;
    if (
      margin > 0 &&
      loserLineup.bestBench &&
      loserLineup.worstStarter &&
      loserLineup.bestBench.points - loserLineup.worstStarter.points > margin
    ) {
      const gain = round2(loserLineup.bestBench.points - loserLineup.worstStarter.points);
      whatIfFlip = `${loser} lost by ${margin} pts, but left ${loserLineup.bestBench.name} (${loserLineup.bestBench.points} pts) on the bench while starting ${loserLineup.worstStarter.name} (${loserLineup.worstStarter.points} pts) — a +${gain} pt swing that would have won the week!`;
    }

    matchups.push({
      matchupId,
      teamA,
      teamAAvatar: infoA?.avatarUrl || null,
      teamARecord: standA?.record || '0-0',
      scoreA,
      benchPointsA: lineupA.benchPoints,
      mvpStarterA: lineupA.mvpStarter,
      worstStarterA: lineupA.worstStarter,
      bestBenchA: lineupA.bestBench,

      teamB,
      teamBAvatar: infoB?.avatarUrl || null,
      teamBRecord: standB?.record || '0-0',
      scoreB,
      benchPointsB: lineupB.benchPoints,
      mvpStarterB: lineupB.mvpStarter,
      worstStarterB: lineupB.worstStarter,
      bestBenchB: lineupB.bestBench,

      winner,
      loser,
      margin,
      whatIfFlip,
    });

    if (scoreA > highestScorer.points) {
      highestScorer = {
        team: teamA,
        avatarUrl: infoA?.avatarUrl || null,
        points: scoreA,
        opponent: teamB,
      };
    }
    if (scoreB > highestScorer.points) {
      highestScorer = {
        team: teamB,
        avatarUrl: infoB?.avatarUrl || null,
        points: scoreB,
        opponent: teamA,
      };
    }

    if (scoreA < lowestScorer.points) {
      lowestScorer = {
        team: teamA,
        avatarUrl: infoA?.avatarUrl || null,
        points: scoreA,
        opponent: teamB,
      };
    }
    if (scoreB < lowestScorer.points) {
      lowestScorer = {
        team: teamB,
        avatarUrl: infoB?.avatarUrl || null,
        points: scoreB,
        opponent: teamA,
      };
    }

    if (margin > biggestBlowout.margin) {
      biggestBlowout = {
        winner,
        winnerAvatar,
        loser,
        loserAvatar,
        winnerPoints,
        loserPoints,
        margin,
      };
    }
    if (margin < closestGame.margin) {
      closestGame = {
        winner,
        winnerAvatar,
        loser,
        loserAvatar,
        winnerPoints,
        loserPoints,
        margin,
      };
    }

    if (lineupA.benchPoints > benchKing.benchPoints) {
      benchKing = {
        team: teamA,
        avatarUrl: infoA?.avatarUrl || null,
        benchPoints: lineupA.benchPoints,
        topBenchPlayer: lineupA.bestBench,
      };
    }
    if (lineupB.benchPoints > benchKing.benchPoints) {
      benchKing = {
        team: teamB,
        avatarUrl: infoB?.avatarUrl || null,
        benchPoints: lineupB.benchPoints,
        topBenchPlayer: lineupB.bestBench,
      };
    }
  }

  // Parse Week N Transactions (Waivers, Free Agents, Trades)
  const parsedTransactions: TransactionTelemetry[] = [];
  if (Array.isArray(transactions)) {
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i] as any;
      if (tx.status !== 'complete') continue;
      if (!['waiver', 'free_agent', 'trade'].includes(tx.type)) continue;

      const rosterIds: number[] = Array.isArray(tx.roster_ids) ? tx.roster_ids : [];
      const managers = rosterIds.map(
        (rid) => rosterInfoMap.get(rid)?.displayName || `Team ${rid}`
      );
      const faabBid = Number(tx.settings?.waiver_bid || 0);

      const added: PlayerHighlight[] = [];
      if (tx.adds && typeof tx.adds === 'object') {
        for (const pid of Object.keys(tx.adds)) {
          const pts = weekPlayerPoints.get(String(pid)) || 0;
          added.push(resolvePlayer(pid, pts));
        }
      }

      const dropped: PlayerHighlight[] = [];
      if (tx.drops && typeof tx.drops === 'object') {
        for (const pid of Object.keys(tx.drops)) {
          const pts = weekPlayerPoints.get(String(pid)) || 0;
          dropped.push(resolvePlayer(pid, pts));
        }
      }

      if (added.length === 0 && dropped.length === 0) continue;

      const mgrText = managers.join(' & ');
      const addText = added.map((p) => `${p.name} (${p.points} pts)`).join(', ');
      const dropText = dropped.map((p) => `${p.name} (${p.points} pts)`).join(', ');
      const bidText = faabBid > 0 ? ` for $${faabBid} FAAB` : '';

      const summary =
        tx.type === 'trade'
          ? `TRADE between ${mgrText}: exchanged ${addText}`
          : `${mgrText} (${tx.type.toUpperCase()}${bidText}): Added ${addText || 'nobody'}${
              dropText ? `, Dropped ${dropText}` : ''
            }`;

      parsedTransactions.push({
        id: `${week}-tx-${i}`,
        type: tx.type,
        managers,
        faabBid,
        added,
        dropped,
        summary,
      });
    }
  }

  // Sort transactions so highest FAAB bids, trades, and high-scoring drops/adds appear first
  parsedTransactions.sort((a, b) => {
    if (a.type === 'trade' && b.type !== 'trade') return -1;
    if (b.type === 'trade' && a.type !== 'trade') return 1;
    if (b.faabBid !== a.faabBid) return b.faabBid - a.faabBid;
    const maxPtsA = Math.max(
      0,
      ...a.added.map((p) => p.points),
      ...a.dropped.map((p) => p.points)
    );
    const maxPtsB = Math.max(
      0,
      ...b.added.map((p) => p.points),
      ...b.dropped.map((p) => p.points)
    );
    return maxPtsB - maxPtsA;
  });

  // Next Week (week + 1) Matchups Preview
  const nextWeekRaw = (allMatchupsByWeek[week] || []) as any[];
  const nextWeekGroups = new Map<number, any[]>();
  for (const m of nextWeekRaw) {
    if (!m.matchup_id) continue;
    if (!nextWeekGroups.has(m.matchup_id)) nextWeekGroups.set(m.matchup_id, []);
    nextWeekGroups.get(m.matchup_id)!.push(m);
  }

  const nextWeekMatchups: NextWeekMatchupPreview[] = [];
  for (const [matchupId, pair] of Array.from(nextWeekGroups.entries())) {
    if (pair.length !== 2) continue;
    const [m1, m2] = pair;
    const infoA = rosterInfoMap.get(m1.roster_id);
    const infoB = rosterInfoMap.get(m2.roster_id);
    const standA = standingByRosterId.get(m1.roster_id);
    const standB = standingByRosterId.get(m2.roster_id);

    nextWeekMatchups.push({
      matchupId,
      teamA: infoA?.displayName || `Team ${m1.roster_id}`,
      teamAAvatar: infoA?.avatarUrl || null,
      teamARecord: standA?.record || '0-0',
      teamAFpts: standA?.fpts || 0,
      teamB: infoB?.displayName || `Team ${m2.roster_id}`,
      teamBAvatar: infoB?.avatarUrl || null,
      teamBRecord: standB?.record || '0-0',
      teamBFpts: standB?.fpts || 0,
    });
  }

  return {
    week,
    generatedAt: new Date().toISOString(),
    pulse: {
      highestScorer:
        highestScorer.points >= 0
          ? highestScorer
          : { team: 'N/A', avatarUrl: null, points: 0, opponent: 'N/A' },
      lowestScorer:
        lowestScorer.points < 99999
          ? lowestScorer
          : { team: 'N/A', avatarUrl: null, points: 0, opponent: 'N/A' },
      biggestBlowout:
        biggestBlowout.margin >= 0
          ? biggestBlowout
          : {
              winner: 'N/A',
              winnerAvatar: null,
              loser: 'N/A',
              loserAvatar: null,
              winnerPoints: 0,
              loserPoints: 0,
              margin: 0,
            },
      closestGame:
        closestGame.margin < 99999
          ? closestGame
          : {
              winner: 'N/A',
              winnerAvatar: null,
              loser: 'N/A',
              loserAvatar: null,
              winnerPoints: 0,
              loserPoints: 0,
              margin: 0,
            },
      benchKing:
        benchKing.benchPoints >= 0
          ? benchKing
          : { team: 'N/A', avatarUrl: null, benchPoints: 0, topBenchPlayer: null },
    },
    matchups,
    standings,
    transactions: parsedTransactions.slice(0, 12),
    nextWeekMatchups,
  };
}

