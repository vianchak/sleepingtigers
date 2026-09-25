export interface SleeperUser {
  user_id: string;
  display_name: string;
  avatar: string | null;
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string | null; // Can be null if the team is unowned
  players: string[]; // List of player IDs currently on roster
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal?: number;
    fpts_against: number;
    fpts_against_decimal?: number;
    ppts?: number;
    ppts_decimal?: number;
    total_moves?: number;
  };
}

export interface SleeperMatchup {
  matchup_id: number;
  roster_id: number;
  points: number;
  custom_points: number | null;
  players_points?: Record<string, number>;
  starters_points?: number[];
}

export interface SleeperTransaction {
  status: string;
  type: string;
  roster_ids: number[];
}

// Internal merged representations for our stats engine
export interface TeamStats {
  rosterId: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  wins: number;
  losses: number;
  ties: number;
  fpts: number;
  fptsAgainst: number;
  ppts: number;
  totalMoves: number;
  participationTrophies: number;
  maxPlayerPercentage: number;
  weeklyScores: Record<number, number>; // week -> points scored
  weeklyBenchPoints: Record<number, number>; // week -> bench points
  weeklyMatchupIds: Record<number, number>; // week -> matchup_id (to know who they played)
  weeklyOpponentRosterIds: Record<number, number | null>; // week -> opponent roster_id
}

export interface HistoricalTeam {
  rosterId: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  wins: number;
  losses: number;
  ties: number;
  fpts: number;
  fptsAgainst: number;
}

export interface LeagueHistory {
  year: string;
  leagueId: string;
  winner: HistoricalTeam | null;
  loser: HistoricalTeam | null;
}

export interface ScheduleTeam {
  rosterId: number;
  name: string;
  avatarUrl: string | null;
  points: number;
}

export interface ScheduleMatchup {
  matchupId: number;
  teamA: ScheduleTeam;
  teamB: ScheduleTeam;
}

export interface WeeklySchedule {
  week: number;
  isCompleted: boolean;
  matchups: ScheduleMatchup[];
}

export interface DraftPick {
  pickNo: number;
  round: number;
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  rosterId: number;
  pickedBy: string;
  totalPoints: number;
  valueScore: number;
}

export interface ManagerDraftGrade {
  managerName: string;
  avatarUrl: string | null;
  totalPoints: number;
  expectedPoints: number;
  valueOverExpected: number;
  grade: string;
}

export interface BiggestRegret {
  managerName: string;
  avatarUrl: string | null;
  draftedPlayer: DraftPick;
  passedPlayer: DraftPick;
  pointDiff: number;
}

export interface PositionalReach {
  managerName: string;
  avatarUrl: string | null;
  reachPlayer: DraftPick;
  passedPlayer: DraftPick;
  pointDiff: number;
}

export interface WaiverHero {
  managerName: string;
  avatarUrl: string | null;
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  totalPoints: number;
}

export interface RedraftPick {
  actualPickNo: number;
  shouldHaveGone: number;
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  totalPoints: number;
  draftedBy: string;
}

export interface DraftReport {
  steal: DraftPick | null;
  bust: DraftPick | null;
  managerGrades: ManagerDraftGrade[];
  biggestRegret: BiggestRegret | null;
  positionalReach: PositionalReach | null;
  waiverHero: WaiverHero | null;
  redraftBoard: RedraftPick[];
}

export interface RivalryUser {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Rivalry {
  managerA: RivalryUser;
  managerB: RivalryUser;
  winsA: number;
  winsB: number;
  totalMatches: number;
}

export interface AllTimeMatchupTeam {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  points: number;
}

export interface AllTimeMatchup {
  season: string;
  week: number;
  teamA: AllTimeMatchupTeam;
  teamB: AllTimeMatchupTeam;
}

export interface PowerRankingTeam {
  team: TeamStats;
  powerScore: number;
  rank: number;
  trueWinPct: number;
  recentForm: number;
}
