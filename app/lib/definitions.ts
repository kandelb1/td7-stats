export type Team = {
  id: number;
  captain: string;
  name: string;
  roster: {id: number; name: string;}[];
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

export type Player = {
  id: number;
  name: string;
  round: number; // TODO: does td7 have rounds?
  teamId: number;
}


export type MapStats = {
  id: number;
  name: string;
  wins: number;
  losses: number;
}

export type WeaponStats = {
  weaponName: string;
  damage: number;
  kills: number;
  shotsFired: number;
  shotsHit: number;
  accuracy: number;
}

export type TeamInfo = {
  teamName: string;
  captain: string;
  wins: number;
  losses: number;
  matches: Match[];
  games: Game[];
  players: Player[];
  mapStats: MapStats[];
}

export type PlayerGame = {
  id: number;
  week: number;
  map: string;
  teamScore: number;
  enemyTeamScore: number;
  playerScore: number;
  rank: number;
  damageDealt: number;
  damageTaken: number;
  kills: number;
  deaths: number;
  // mostKills?: boolean;
  // mostDeaths?: boolean;
  // mostDamageDone?: boolean;
  // leastDamageDone?: boolean;
  // mostDamageTaken?: boolean;
  // leastDamageTaken?: boolean;
}

export type PlayerInfo = {
  id: number;
  name: string;
  aliases: string[];
  round: number;
  teamId: number;
  teamName: string;
  totalWeaponStats: WeaponStats[];
  averageDamageDealt: number;
  averageDamageTaken: number;
  netDamage: number;
  games: PlayerGame[];
}