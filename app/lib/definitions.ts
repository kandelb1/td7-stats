export type Team = {
  id: number;
  name: string;
  roster: {id: number; name: string;}[];
};

export type Map = {
  id: number;
  name: string;
};

// TODO: unsure how td7 matchups and scoring works yet
// export type Match = {
//   week: number;
//   score: number;
//   enemy: string;
//   enemyScore: number;
// }

export type Player = {
  id: number;
  name: string;
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

export type ServerStats = {
  id: number;
  name: string;
  wins: number;
  losses: number;
}

export type TeamSummary = {
  wins: number;
  losses: number;
  mostPlayedMaps: {name: string; totalGames: number; winPercentage: number}[];
  roster: {id: number; name: string; gamesPlayed: number; wins: number; losses: number;}[];
  // recentMatches: Match[]; TODO: waiting to hear how matches work
}

export type TeamStatistics = {
  mapStats: MapStats[];
  serverStats: ServerStats[];
  weaponStats: {weaponName: string; totalDamage: number;}[];
}

export type PlayerGame = {
  id: number;
  date: number;
  map: string;
  teamScore: number;
  enemyTeamScore: number;
  playerScore: number;
  rank: number;
  damageDealt: number;
  damageTaken: number;
  kills: number;
  deaths: number;
}

export type PlayerInfo = {
  id: number;
  name: string;
  aliases: string[];
  teamId: number;
  teamName: string;
  totalWeaponStats: WeaponStats[];
  averageDamageDealt: number;
  averageDamageTaken: number;
  netDamage: number;
  games: PlayerGame[];
}

export type PlayerSummary = {
  wins: number;
  losses: number;
  frags: number;
  deaths: number;
  hits: number;
  shots: number;
  damageDealt: number;
  damageTaken: number;
  recentAwards: {name: string; description: string; gameId: number; date: number}[];
  recentMatches: {date: number, gameId: number; map: string; playerRank: number; teamScore: number; enemyTeamScore: number}[];
  recentCompetitors: {playerId: number; name: string;}[];
}