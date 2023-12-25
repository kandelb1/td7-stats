export type Team = {
  id: number;
  captain: string;
  name: string;
};

export type Map = {
  id: number;
  name: string;
};

export type Game = {
  week: number; // TODO: might change
  id: number;
  map: string;
  score: number;
  enemyScore: number;
}

// TODO: unsure how td7 matchups and scoring works yet
export type Match = {
  week: number;
  score: number;
  enemy: string;
  enemyScore: number;
}

export type PlayerInfo = {
  id: number;
  name: string;
  aliases: string[];
  round: number; // TODO: might change
}

export type MapStats = {
  id: number;
  name: string;
  wins: number;
  losses: number;
}

export type TeamInfo = {
  teamName: string;
  captain: string;
  wins: number;
  losses: number;
  matches: Match[];
  games: Game[];
  players: PlayerInfo[];
  mapStats: MapStats[];
}