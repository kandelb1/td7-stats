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

export async function getTeamInfo(teamId: string): Promise<TeamInfo | null> {
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
                                  ) AS valid", teamId);
  if(validTeamId['valid'] == 0) { // stop now
    console.error(`Ignoring invalid teamId: ${teamId}`);
    return null;
  }

  let teamInfo = await db.get("SELECT name, (\
                              SELECT count(1) FROM tgStats\
                              WHERE teamId == ? AND tgStats.score > tgStats.enemyScore\
                            ) AS wins, (\
                              SELECT count(1) FROM tgStats\
                              WHERE teamId == ? AND tgStats.score < tgStats.enemyScore\
                            ) AS losses FROM teams WHERE id == ?", teamId, teamId, teamId);

  // let matches = await db.all("SELECT week, score, teams.name AS enemy, enemy_score AS enemyScore FROM matches\
  //                         INNER JOIN teams ON matches.enemy_teamId == teams.id\
  //                         WHERE matches.teamId == ?", id);

  let games = await db.all("SELECT games.id, maps.name AS map, tgStats.score, tgStats.enemyScore FROM games\
                        INNER JOIN maps ON games.mapId == maps.id\
                        INNER JOIN tgStats ON tgStats.gameId == games.id\
                        WHERE tgStats.teamId == ?", teamId);


  let players = await db.all("SELECT x.id, (\
                              SELECT name FROM playerNames\
                              WHERE playerNames.playerId == x.id\
                              GROUP BY name\
                              ORDER BY count(1) DESC\
                              LIMIT 1\
                            ) AS name\
                            FROM (SELECT id FROM players WHERE players.teamId == ?) x\
                            INNER JOIN players ON players.id == x.id", teamId);
  
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
                            FROM (SELECT * FROM maps) x", teamId, teamId);

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

export async function getPlayerInfo(playerId: string): Promise<PlayerInfo | null> {
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
                                    ) AS valid", playerId);
  if(validPlayerId['valid'] == 0) { // stop now
    console.error(`Ignoring invalid playerId: ${playerId}`);
    return null;
  }

  let basicInfo = await db.get("SELECT players.id, teams.name AS teamName, players.name, players.teamId FROM players\
                                INNER JOIN teams ON players.teamId == teams.id\
                                WHERE players.id == ?", playerId);

  let aliases = await db.all("SELECT name FROM playerNames\
                              WHERE playerId == ?\
                              GROUP BY name\
                              ORDER BY count(1) DESC", playerId);

  let totalWeapStats = await db.all("SELECT weaponName, sum(damage) AS damage, sum(kills) AS kills,\
                                    sum(shotsFired) AS shotsFired, sum(shotsHit) AS shotsHit,\
                                    CAST(sum(shotsHit) AS float) / sum(shotsFired) * 100 AS accuracy FROM pwStats\
                                    INNER JOIN players ON playerId == players.id\
                                    WHERE playerId == ?\
                                    GROUP BY weaponName", playerId);

  let avgDamages = await db.get("SELECT round(avg(damageDealt), 2) AS averageDamageDealt, round(avg(damageTaken), 2) AS averageDamageTaken,\
                          round(avg(damageDealt) - avg(damageTaken), 2) AS netDamage FROM pgStats\
                          WHERE playerId == ?", playerId);

  let games = await db.all("SELECT games.id, games.date, maps.name AS map, tgStats.score AS teamScore, tgStats.enemyScore AS enemyTeamScore,\
                          pgStats.rank, pgStats.score AS playerScore, pgStats.damageDealt, pgStats.damageTaken,\
                          pgStats.kills, pgStats.deaths FROM pgStats\
                          INNER JOIN players ON players.id == ?\
                          INNER JOIN games ON pgStats.gameId == games.id\
                          INNER JOIN tgStats ON tgStats.gameId == games.id AND players.teamId == tgStats.teamId\
                          INNER JOIN maps ON games.mapId == maps.id\
                          WHERE pgStats.playerId == ?\
                          ORDER BY date DESC", playerId, playerId);

  let answer: PlayerInfo = {
    ...basicInfo,
    aliases: aliases,
    totalWeaponStats: totalWeapStats,
    ...avgDamages,
    games: games,
  };
  
  return answer;
}

export async function getPlayerSummary(playerId: string, teamId: string): Promise<PlayerSummary | null> {
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
                                    ) AS valid", playerId);
  if(validPlayerId['valid'] == 0) { // stop now
    console.error(`Ignoring invalid playerId: ${playerId}`);
    return null;
  }
  
  let pgStats = await db.get("SELECT sum(damageDealt) AS damageDealt, sum(damageTaken) AS damageTaken,\
                            sum(kills) AS frags, sum(deaths) AS deaths FROM pgStats\
                            WHERE pgStats.playerId = ?", playerId);

  let pwStats = await db.get("SELECT sum(shotsFired) AS shots, sum(shotsHit) AS hits FROM pwStats\
                            WHERE playerId = ?", playerId);
  
  let wins = await db.get("SELECT count(1) AS wins FROM tgStats\
                          WHERE gameId IN (\
                            SELECT gameId FROM pgStats WHERE playerId = ?\
                          ) AND teamId = ? AND score > enemyScore", playerId, teamId);

  let losses = await db.get("SELECT count(1) AS losses FROM tgStats\
                            WHERE gameId IN (\
                              SELECT gameId FROM pgStats WHERE playerId = ?\
                           ) AND teamId = ? AND score < enemyScore", playerId, teamId);

  let recentMatches = await db.all("SELECT games.date, pgStats.gameId, maps.name AS map, pgStats.rank AS playerRank,\
                                    tgStats.score AS teamScore, tgStats.enemyScore AS enemyTeamScore FROM games\
                                    INNER JOIN pgStats ON pgStats.gameId = games.id\
                                    INNER JOIN tgStats ON tgStats.gameId = games.id\
                                    INNER JOIN maps ON games.mapId = maps.id\
                                    WHERE pgStats.playerId = ? AND tgSTats.teamId = ?\
                                    ORDER BY games.date DESC\
                                    LIMIT 4", playerId, teamId);

  let recentCompetitors = await db.all("SELECT players.id AS playerId, players.name FROM players\
                                        INNER JOIN pgStats ON pgStats.playerId = players.id\
                                        INNER JOIN games ON pgStats.gameId = games.id\
                                        WHERE pgStats.gameId IN (\
                                          SELECT games.id FROM games\
                                          INNER JOIN pgStats ON pgStats.gameId = games.id\
                                          WHERE pgStats.playerId = ?\
                                        ) AND players.teamId != ?\
                                        GROUP BY players.id\
                                        ORDER BY games.date DESC, name\
                                        LIMIT 12", playerId, teamId);

  let answer: PlayerSummary = {
    ...pgStats,
    ...pwStats,
    ...wins,
    ...losses,
    recentMatches: recentMatches,
    recentCompetitors: recentCompetitors,
  };
  // console.log('answer:');
  // console.log(answer);
  return answer;
}

export async function getPlayerTeamId(playerId: string): Promise<string | null> { // it actually returns a number but shhh..don't tell anyone
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
                                    ) AS valid", playerId);
  if(validPlayerId['valid'] == 0) { // stop now
    console.error(`Ignoring invalid playerId: ${playerId}`);
    return null;
  }

  let teamId = await db.get("SELECT teamId FROM players\
                            WHERE id = ?", playerId);

  return teamId['teamId'];
}