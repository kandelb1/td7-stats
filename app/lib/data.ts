import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'
import { Player, Team, TeamInfo, PlayerInfo, PlayerSummary } from './definitions';

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
  // TODO: this will need to change when round_pick is removed from the db
  for(let i = 0; i < teamsList.length; i++){
    const roster = await db.all("SELECT id, name FROM players\
                                WHERE teamId == ?\
                                ORDER BY name", teamsList[i].id);
    teamsList[i].roster = roster;
  }
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

  let teamInfo = await db.get("SELECT name, (\
                              SELECT count(1) FROM tgStats\
                              WHERE teamId == ? AND tgStats.score > tgStats.enemyScore\
                            ) AS wins, (\
                              SELECT count(1) FROM tgStats\
                              WHERE teamId == ? AND tgStats.score < tgStats.enemyScore\
                            ) AS losses FROM teams WHERE id == ?", id, id, id);

  // let matches = await db.all("SELECT week, score, teams.name AS enemy, enemy_score AS enemyScore FROM matches\
  //                         INNER JOIN teams ON matches.enemy_teamId == teams.id\
  //                         WHERE matches.teamId == ?", id);

  let games = await db.all("SELECT games.id, maps.name AS map, tgStats.score, tgStats.enemyScore FROM games\
                        INNER JOIN maps ON games.mapId == maps.id\
                        INNER JOIN tgStats ON tgStats.gameId == games.id\
                        WHERE tgStats.teamId == ?", id);


  let players = await db.all("SELECT x.id, (\
                              SELECT name FROM playerNames\
                              WHERE playerNames.playerId == x.id\
                              GROUP BY name\
                              ORDER BY count(1) DESC\
                              LIMIT 1\
                            ) AS name\
                            FROM (SELECT id FROM players WHERE players.teamId == ?) x\
                            INNER JOIN players ON players.id == x.id", id);
  
  // TODO: is it possible to integrate this into the sql statement above?
  for(let i = 0; i < players.length; i++) { // TODO: Player type doesn't have an 'aliases' property anymore
    let playerId = players[i]['id'];
    players[i]['aliases'] = await db.all("SELECT name FROM playerNames\
                                        WHERE playerNames.playerId == ?\
                                        GROUP BY name", playerId);
  }

  let mapStats = await db.all("SELECT x.id, x.name, (\
                              SELECT count(1) FROM tgStats\
                              INNER JOIN games ON tgStats.gameId == games.id AND games.mapId == x.id\
                              WHERE score > enemyScore AND teamId == ?\
                            ) AS wins, (\
                              SELECT count(1) FROM tgStats\
                              INNER JOIN games ON tgStats.gameId == games.id AND games.mapId == x.id\
                              WHERE score < enemyScore AND teamId == ?\
                            ) AS losses\
                            FROM (SELECT * FROM maps) x", id, id);

  let answer: TeamInfo = {
    teamName: teamInfo['name'],
    wins: teamInfo['wins'],
    losses: teamInfo['losses'],
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
  
  let result = await db.all<Player[]>("SELECT id, name, teamId FROM players\
                                       ORDER BY teamId, name");
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

  let basicInfo = await db.get("SELECT players.id, teams.name AS teamName, players.name, players.teamId FROM players\
                                INNER JOIN teams ON players.teamId == teams.id\
                                WHERE players.id == ?", id);

  let aliases = await db.all("SELECT name FROM playerNames\
                              WHERE playerId == ?\
                              GROUP BY name\
                              ORDER BY count(1) DESC", id);

  let totalWeapStats = await db.all("SELECT weaponName, sum(damage) AS damage, sum(kills) AS kills,\
                                    sum(shotsFired) AS shotsFired, sum(shotsHit) AS shotsHit,\
                                    CAST(sum(shotsHit) AS float) / sum(shotsFired) * 100 AS accuracy FROM pwStats\
                                    INNER JOIN players ON playerId == players.id\
                                    WHERE playerId == ?\
                                    GROUP BY weaponName", id);

  let avgDamages = await db.get("SELECT round(avg(damageDealt), 2) AS averageDamageDealt, round(avg(damageTaken), 2) AS averageDamageTaken,\
                          round(avg(damageDealt) - avg(damageTaken), 2) AS netDamage FROM pgStats\
                          WHERE playerId == ?", id);

  let games = await db.all("SELECT games.id, games.date, maps.name AS map, tgStats.score AS teamScore, tgStats.enemyScore AS enemyTeamScore,\
                          pgStats.rank, pgStats.score AS playerScore, pgStats.damageDealt, pgStats.damageTaken,\
                          pgStats.kills, pgStats.deaths FROM pgStats\
                          INNER JOIN players ON players.id == ?\
                          INNER JOIN games ON pgStats.gameId == games.id\
                          INNER JOIN tgStats ON tgStats.gameId == games.id AND players.teamId == tgStats.teamId\
                          INNER JOIN maps ON games.mapId == maps.id\
                          WHERE pgStats.playerId == ?\
                          ORDER BY date DESC", id, id);

  let answer: PlayerInfo = {
    ...basicInfo,
    aliases: aliases,
    totalWeaponStats: totalWeapStats,
    ...avgDamages,
    games: games,
  };
  
  return answer;
}

export async function getPlayerSummary(id: string): Promise<PlayerSummary | null> {
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
  
  let summary = await db.get("SELECT a.damageDealt, a.damageTaken, b.shots, b.hits, c.wins, d.losses FROM\
                (\
                  SELECT sum(damageDealt) AS damageDealt, sum(damageTaken) AS damageTaken FROM pgStats\
                  WHERE playerId == ?\
                ) AS a,\
                (\
                  SELECT sum(shotsFired) AS shots, sum(shotsHit) AS hits FROM pwStats\
                  WHERE playerId == ?\
                ) as b,\
                (\
                  SELECT count(1) AS wins FROM tgStats\
                  WHERE gameId IN (\
                    SELECT gameId FROM pgStats WHERE playerId == ?\
                  ) AND teamId == (\
                    SELECT teamId FROM players WHERE id == ?\
                  )\
                  AND score > enemyScore\
                ) AS c,\
                (\
                  SELECT count(1) AS losses FROM tgStats\
                  WHERE gameId IN (\
                    SELECT gameId FROM pgStats WHERE playerId == ?\
                  ) AND teamId == (\
                    SELECT teamId FROM players WHERE id == ?\
                  )\
                  AND score < enemyScore\
                ) AS d", id, id, id, id, id, id);

  return summary;
}