import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'
import { Player, Team, TeamInfo, PlayerInfo } from './definitions';

let db: Database<sqlite3.Database, sqlite3.Statement>;

console.log('data.ts running');


export async function getTeamsList(): Promise<Team[]> {
  if(!db) {
    console.log('connecting to database');
    db = await open({
      filename: './stats.db',
      driver: sqlite3.Database,
    });
  }

  const teamsList = await db.all<Team[]>("SELECT * FROM teams");
  return teamsList;
}

export async function getTeamInfo(id: string): Promise<TeamInfo | null> {
  if(!db) {
    console.log('connecting to database');
    db = await open({
      filename: './stats.db',
      driver: sqlite3.Database,
    });
  }

  // check if this teamId exists before doing anything
  let validTeamId = await db.get("SELECT EXISTS(\
                                    SELECT 1 FROM teams\
                                    WHERE id == ?\
                                  ) AS valid", id);
  if(validTeamId['valid'] == 0) { // stop now
    console.error(`Ignoring invalid teamId: ${id}`);
    return null;
  }

  let teamInfo = await db.get("SELECT captain, name, (\
                              SELECT count(1) FROM team_stats\
                              WHERE team_id == ? AND team_stats.score > team_stats.enemy_score\
                            ) AS wins, (\
                              SELECT count(1) FROM team_stats\
                              WHERE team_id == ? AND team_stats.score < team_stats.enemy_score\
                            ) AS losses FROM teams WHERE id == ?", id, id, id);

  let matches = await db.all("SELECT week, score, teams.name AS enemy, enemy_score AS enemyScore FROM matches\
                          INNER JOIN teams ON matches.enemy_team_id == teams.id\
                          WHERE matches.team_id == ?", id);

  let games = await db.all("SELECT games.week, games.id, maps.name AS map, team_stats.score, team_stats.enemy_score AS enemyScore FROM games\
                        INNER JOIN maps ON games.map_id == maps.id\
                        INNER JOIN team_stats ON team_stats.game_id == games.id\
                        WHERE team_stats.team_id == ?", id);


  let players = await db.all("SELECT x.id, (\
                              SELECT name FROM player_names\
                              WHERE player_names.player_id == x.id\
                              GROUP BY name\
                              ORDER BY count(1) DESC\
                              LIMIT 1\
                            ) AS name, players.round_pick AS round\
                            FROM (SELECT id FROM players WHERE players.team_id == ?) x\
                            INNER JOIN players ON players.id == x.id\
                            ORDER BY round", id);
  
  // TODO: is it possible to integrate this into the sql statement above?
  for(let i = 0; i < players.length; i++) { // TODO: Player type doesn't have an 'aliases' property anymore
    let player_id = players[i]['id'];
    players[i]['aliases'] = await db.all("SELECT name FROM player_names\
                                        WHERE player_names.player_id == ?\
                                        GROUP BY name", player_id);
  }

  let mapStats = await db.all("SELECT x.id, x.name, (\
                              SELECT count(1) FROM team_stats\
                              INNER JOIN games ON team_stats.game_id == games.id AND games.map_id == x.id\
                              WHERE score > enemy_score AND team_id == ?\
                            ) AS wins, (\
                              SELECT count(1) FROM team_stats\
                              INNER JOIN games ON team_stats.game_id == games.id AND games.map_id == x.id\
                              WHERE score < enemy_score AND team_id == ?\
                            ) AS losses\
                            FROM (SELECT * FROM maps) x", id, id);

  let answer: TeamInfo = {
    teamName: teamInfo['name'],
    captain: teamInfo['captain'],
    wins: teamInfo['wins'],
    losses: teamInfo['losses'],
    matches: matches,
    games: games,
    players: players,
    mapStats: mapStats,
  }

  return answer;
}

export async function getPlayerList(): Promise<Player[]> {
  if(!db) {
    console.log('connecting to database');
    db = await open({
      filename: './stats.db',
      driver: sqlite3.Database,
    });
  }
  
  let result = await db.all<Player[]>("SELECT id, name, round_pick AS round, team_id AS teamId FROM players\
                                       ORDER BY teamId, round");
  return result;
}

export async function getPlayerInfo(id: string): Promise<PlayerInfo | null> {
  if(!db) {
    console.log('connecting to database');
    db = await open({
      filename: './stats.db',
      driver: sqlite3.Database,
    });
  }

  // check if this playerId exists before doing anything
  let validPlayerId = await db.get("SELECT EXISTS(\
                                      SELECT 1 FROM players\
                                      WHERE id == ?\
                                    ) AS valid", id);
  if(validPlayerId['valid'] == 0) { // stop now
    console.error(`Ignoring invalid playerId: ${id}`);
    return null;
  }

  let basicInfo = await db.get("SELECT players.id, teams.name AS teamName, players.name, players.round_pick AS round,\
                                players.team_id AS teamId FROM players\
                                INNER JOIN teams ON players.team_id == teams.id\
                                WHERE players.id == ?", id);

  let aliases = await db.all("SELECT name FROM player_names\
                              WHERE player_id == ?\
                              GROUP BY name\
                              ORDER BY count(1) DESC", id);

  let totalWeapStats = await db.all("SELECT weapon_name AS weaponName, sum(damage) AS damage, sum(kills) AS kills,\
                                    sum(shots_fired) AS shotsFired, sum(shots_hit) AS shotsHit,\
                                    CAST(sum(shots_hit) AS float) / sum(shots_fired) * 100 AS accuracy FROM pw_stats\
                                    INNER JOIN players ON player_id == players.id\
                                    WHERE player_id == ?\
                                    GROUP BY weapon_name", id);

  let avgDamages = await db.get("SELECT round(avg(damage_dealt), 2) AS averageDamageDealt, round(avg(damage_taken), 2) AS averageDamageTaken,\
                          round(avg(damage_dealt) - avg(damage_taken), 2) AS netDamage FROM pg_stats\
                          WHERE player_id == ?", id);

  let games = await db.all("SELECT games.id, games.week, maps.name AS map, team_stats.score AS teamScore, team_stats.enemy_score AS enemyTeamScore,\
                          pg_stats.rank, pg_stats.score AS playerScore, pg_stats.damage_dealt AS damageDealt, pg_stats.damage_taken AS damageTaken,\
                          pg_stats.kills, pg_stats.deaths FROM pg_stats\
                          INNER JOIN players ON players.id == ?\
                          INNER JOIN games ON pg_stats.game_id == games.id\
                          INNER JOIN team_stats ON team_stats.game_id == games.id AND players.team_id == team_stats.team_id\
                          INNER JOIN maps ON games.map_id == maps.id\
                          WHERE pg_stats.player_id == ?\
                          ORDER BY week", id, id);

  let answer: PlayerInfo = {
    ...basicInfo,
    aliases: aliases,
    totalWeaponStats: totalWeapStats,
    ...avgDamages,
    games: games,
  };
  
  return answer;
}