import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'
import { Player, Team, PlayerInfo, PlayerSummary, TeamSummary, TeamStatistics } from './definitions';

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

export async function getTeamName(teamId: string): Promise<string | null> {
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

  let answer = await db.get("SELECT name FROM teams WHERE id = ?", teamId);
  return answer['name'];
}

export async function getTeamSummary(teamId: string): Promise<TeamSummary | null> {
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

  let winsAndLosses = await db.get("SELECT count(CASE WHEN tgStats.score > tgStats.enemyScore THEN 1 END) AS wins,\
                                  count(CASE WHEN tgStats.score < tgStats.enemyScore THEN 1 END) AS losses\
                                  FROM tgStats\
                                  WHERE teamId = ?", teamId);

  let mostPlayedMaps = await db.all("SELECT maps.name, count(1) AS totalGames,\
                                    round(count(CASE WHEN tgStats.score > tgStats.enemyScore THEN 1 END) * 1.0 / count(1) * 100, 2) AS winPercentage\
                                    FROM tgStats\
                                    INNER JOIN games ON games.id = tgStats.gameId\
                                    INNER JOIN maps ON maps.id = games.mapId\
                                    WHERE (tgStats.score > tgStats.enemyScore OR tgStats.score < tgStats.enemyScore) AND tgStats.teamId = ?\
                                    GROUP BY maps.name\
                                    ORDER BY totalGames DESC, name\
                                    LIMIT 3", teamId);

  let roster = await db.all("SELECT players.id, players.name, count(pgStats.playerId) AS gamesPlayed,\
                            SUM(CASE WHEN tgStats.score > tgStats.enemyScore THEN 1 ELSE 0 END) AS wins,\
                            SUM(CASE WHEN tgStats.enemyScore > tgStats.score THEN 1 ELSE 0 END) as losses\
                            FROM players\
                            LEFT JOIN pgStats ON pgStats.playerId = players.id\
                            LEFT JOIN tgStats ON tgStats.gameId = pgStats.gameId AND tgStats.teamId = players.teamId\
                            WHERE players.teamId = ?\
                            GROUP BY players.id\
                            ORDER BY gamesPlayed DESC, name", teamId);
  
  // TODO: waiting to hear official rules on matchups                      
  // let recentMatchups = await db.all("");

  let answer: TeamSummary = {
    wins: winsAndLosses['wins'],
    losses: winsAndLosses['losses'],
    mostPlayedMaps: mostPlayedMaps,
    roster: roster,
  };
  return answer;
}

export async function getTeamStatistics(teamId: string): Promise<TeamStatistics | null> {
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

  let mapStats = await db.all("SELECT maps.id, maps.name,\
                              count(CASE WHEN score > enemyScore AND teamId = ? THEN 1 END) AS wins,\
                              count(CASE WHEN score < enemyScore AND teamId = ? THEN 1 END) AS losses\
                              FROM maps\
                              INNER JOIN games ON games.mapId = maps.id\
                              INNER JOIN tgStats ON tgStats.gameId = games.id\
                              GROUP BY maps.id\
                              HAVING wins + losses > 0", teamId, teamId);

  let serverStats = await db.all("SELECT servers.id, servers.name,\
                                count(CASE WHEN score > enemyScore AND teamId = ? THEN 1 END) AS wins,\
                                count(CASE WHEN score < enemyScore AND teamId = ? THEN 1 END) AS losses\
                                FROM servers\
                                INNER JOIN games ON games.serverId = servers.id\
                                INNER JOIN tgStats ON tgStats.gameId = games.id\
                                GROUP BY servers.id\
                                HAVING wins + losses > 0", teamId, teamId);
  
  let weaponStats = await db.all("SELECT weaponName, sum(damage) AS totalDamage FROM pwStats\
                                INNER JOIN players ON players.id = pwStats.playerId\
                                WHERE players.teamId = ?\
                                GROUP BY weaponName\
                                HAVING totalDamage > 0 ORDER BY totalDamage DESC", teamId);

  let answer: TeamStatistics = {
    mapStats: mapStats,
    serverStats: serverStats,
    weaponStats: weaponStats,
  };
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
  
  let result = await db.all<Player[]>("SELECT players.id, players.name, players.teamId, teams.name AS teamName,\
                                      coalesce(sumpgStats.damageDealt, 0) AS damageDealt, coalesce(sumpgStats.kills, 0) AS kills,\
                                      coalesce(CAST(sumpwStats.shotsHit AS float) / nullif(sumpwStats.shotsFired, 0) * 100, 0) AS accuracy\
                                      FROM players\
                                      INNER JOIN teams ON teams.id = players.teamId\
                                      LEFT JOIN (\
                                        SELECT playerId, sum(damageDealt) AS damageDealt, sum(kills) AS kills FROM pgStats\
                                        GROUP BY playerId\
                                      ) AS sumpgStats ON sumpgStats.playerId = players.id\
                                      LEFT JOIN (\
                                        SELECT playerId, sum(shotsHit) AS shotsHit, sum(shotsFired) AS shotsFired FROM pwStats\
                                        GROUP BY playerId\
                                      ) AS sumpwStats ON sumpwStats.playerId = players.id\
                                      ORDER BY damageDealt DESC");
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

  let info = await db.get("SELECT players.name, teams.name AS teamName FROM players\
                          INNER JOIN teams ON teams.id = players.teamId\
                          WHERE players.id = ?", playerId);

  let answer: PlayerInfo = {
    name: info['name'],
    teamName: info['teamName']
  }
  
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
  
  let pgStats = await db.get("SELECT coalesce(sum(damageDealt), 0) AS damageDealt, coalesce(sum(damageTaken), 0) AS damageTaken,\
                            coalesce(sum(kills), 0) AS frags, coalesce(sum(deaths), 0) AS deaths FROM pgStats\
                            WHERE pgStats.playerId = ?", playerId);

  let pwStats = await db.get("SELECT coalesce(sum(shotsFired), 0) AS shots, coalesce(sum(shotsHit), 0) AS hits FROM pwStats\
                            WHERE playerId = ?", playerId);

  let winsAndLosses = await db.get("SELECT coalesce(sum(CASE WHEN tgStats.score > tgStats.enemyScore THEN 1 ELSE 0 END), 0) AS wins,\
                                  coalesce(sum(CASE WHEN tgStats.score < tgStats.enemyScore THEN 1 ELSE 0 END), 0) AS losses\
                                  FROM tgStats\
                                  WHERE tgStats.gameId IN (\
                                    SELECT gameId FROM pgStats WHERE pgstats.playerId = ?\
                                  ) AND tgStats.teamId = ?", playerId, teamId);

  let recentAwards = await db.all("SELECT awards.name, awards.description, gameId, games.date FROM awardStats\
                                  INNER JOIN awards ON awards.id = awardStats.awardId\
                                  INNER JOIN games ON games.id = awardStats.gameId\
                                  WHERE playerId = ?\
                                  ORDER BY date DESC\
                                  LIMIT 3", playerId);

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
    ...winsAndLosses,
    recentAwards: recentAwards,
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

export async function getAllPlayerIds() {
  if(!db) {
    console.log('connecting to database');
    db = await open({
      filename: './stats.db',
      driver: sqlite3.Database,
    });
  }
  let answer = await db.all("SELECT id FROM players");
  
  return answer;
}

export async function getAllTeamIds() {
  if(!db) {
    console.log('connecting to database');
    db = await open({
      filename: './stats.db',
      driver: sqlite3.Database,
    });
  }
  let answer = await db.all("SELECT id FROM teams");
  return answer;
}