export interface CricbuzzResponse {
  miniscore?: Miniscore;
  matchHeader?: MatchHeader;
  matchCommentary?: Record<string, Commentary>;
  winProbability?: WinProbability;
}

export interface InningsScore {
  inningsId: number;
  batTeamId: number;
  batTeamName: string;
  score: number;
  wickets: number;
  overs: number;
  isDeclared?: boolean;
  isFollowOn?: boolean;
}

export interface Miniscore {
  inningsId: number;
  batTeam: {
    teamId: number;
    teamScore: number;
    teamWkts: number;
  };
  status: string;
  batsmanStriker: PlayerBatting;
  batsmanNonStriker: PlayerBatting;
  bowlerStriker: PlayerBowling;
  bowlerNonStriker: PlayerBowling;
  overs: number;
  target: number | null;
  partnerShip: {
    balls: number;
    runs: number;
  };
  currentRunRate: number;
  requiredRunRate: number;
  lastWicket: string;
  recentOvsStats: string;
  matchScoreDetails: {
    state: string;
    customStatus: string;
    inningsScoreList: InningsScore[];
  };
}

export interface PlayerBatting {
  id: number;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: string;
}

export interface PlayerBowling {
  id: number;
  name: string;
  overs: number;
  maidens: number;
  economy: number;
  runs: number;
  wickets: number;
}

export interface MatchHeader {
  matchDescription: string;
  status: string;
  seriesName: string;
  team1: Team;
  team2: Team;
  matchTeamInfo: Array<{
    battingTeamShortName: string;
    bowlingTeamShortName: string;
  }>;
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
}

export interface Commentary {
  commType: string;
  commText: string;
  overSeparator?: {
    overSummary: string;
  };
}

export interface WinProbability {
  team1: { percent: number; shortName: string };
  team2: { percent: number; shortName: string };
}
