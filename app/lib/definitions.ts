export type Team = {
  id: number;
  name: string;
  roster: {id: number; name: string;}[];
  division: number;
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
  teamName: string;
  damageDealt: number;
  kills: number;
  accuracy: number;
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
  frags: number;
  deaths: number;
  damageDealt: number;
  damageTaken: number;
  hits: number;
  shots: number;
  mostPlayedMaps: {name: string; totalGames: number; winPercentage: number}[];
  roster: {id: number; name: string; gamesPlayed: number; wins: number; losses: number;}[];
  recentMatches: {week: number; score: number; enemyTeamScore: number;}[];
}

export type TeamStatistics = {
  mapStats: MapStats[];
  serverStats: ServerStats[];
  weaponStats: {weaponName: string; totalDamage: number;}[];
}

export type TeamMatch = {
  week: number;
  score: number;
  enemyTeamId: number;
  enemyTeamName: string;    
  enemyTeamScore: number;
  games: {
    id: number;
    date: number;
    mapName: string;
    mapNumber: number;
    score: number;
    enemyScore: number;
    serverName: string;
    roster: {
      playerId: number;
      name: string;
      rank: number;
    }[];
  }[],
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
  name: string;  
  teamName: string;
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
  recentAwards: {name: string; id: number; description: string; gameId: number; date: number, mapNumber: number; enemyClanTag: string}[];
  recentMatches: {date: number, gameId: number; map: string; playerRank: number; teamScore: number; enemyTeamScore: number}[];
  recentCompetitors: {playerId: number; name: string;}[];
}

export type GameInfo = {
  mapName: string;
  mapNumber: number;
  server: string;
  date: number;
  teams: TeamGameInfo[]; // this will always have 2 elements. red team and blue team
}

export type TeamGameInfo = {
  teamId: number;
  teamName: string;
  clanTag: string;
  score: number;
  players: PlayerGameStats[];
  color: number;
}

export type PlayerGameStats = {
  playerId: number;
  playerName: string;
  score: number;
  kills: number;
  deaths: number;
  damageDealt: number;
  damageTaken: number;
  weapons: WeaponStats[];
}

export type PlayerAward = {
  name: string;
  id: number;
  description: string;
  amountEarned: number;
  totalEarned: number;
  playersEarned: number;
}

export type PlayerRecentMatch = {
  date: number;
  gameId: number;
  enemyTeamName: string;
  enemyTeamId: number;
  enemyTeamScore: number;
  teamScore: number;
  serverName: string;
  mapNumber: number;
  mapName: string;
  rank: number;
  score: number;
  kills: number;
  deaths: number;
  damageDealt: number;
  damageTaken: number;
}