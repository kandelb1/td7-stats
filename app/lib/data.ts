import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'
import { Player, Team, PlayerInfo, PlayerSummary, TeamSummary, TeamStatistics, GameInfo, TeamGameInfo, PlayerAward, PlayerRecentMatch, TeamMatch } from './definitions';

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

  let pgStats = await db.get("SELECT coalesce(sum(damageDealt), 0) AS damageDealt, coalesce(sum(damageTaken), 0) AS damageTaken,\
                              coalesce(sum(kills), 0) AS frags, coalesce(sum(deaths), 0) AS deaths FROM pgStats\
                              WHERE playerId IN (\
                                SELECT players.id FROM players\
                                WHERE teamId = ?\
                              )", teamId);

  let pwStats = await db.get("SELECT coalesce(sum(shotsFired), 0) AS shots, coalesce(sum(shotsHit), 0) AS hits FROM pwStats\
                                  WHERE playerId IN (\
                                    SELECT players.id FROM players\
                                    WHERE teamId = ?\
                                  )", teamId);

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

  let recentMatches = await db.all("SELECT week, score, enemyTeamScore, clanTag FROM matches\
                                    INNER JOIN teams ON teams.id = matches.enemyTeamId\
                                    WHERE teamId = ?\
                                    ORDER BY week DESC\
                                    LIMIT 5", teamId);
  
  let division = await db.get("SELECT division FROM teams WHERE id = ?", teamId);  

  let answer: TeamSummary = {
    division: division['division'],
    wins: winsAndLosses['wins'],
    losses: winsAndLosses['losses'],
    ...pgStats,
    ...pwStats,
    mostPlayedMaps: mostPlayedMaps,
    roster: roster,
    recentMatches: recentMatches,
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

export async function getTeamMatches(teamId: string): Promise<TeamMatch[] | null> {
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

  let matches = await db.all("SELECT matches.id, week, score, enemyTeamId, enemyTeamScore, teams.name AS enemyTeamName FROM matches\
                            INNER JOIN teams ON matches.enemyTeamId = teams.id\
                            WHERE teamId = ?\
                            ORDER BY week", teamId);
  
  for(let i = 0; i < matches.length; i++) {
    matches[i]['games'] = await db.all("SELECT tgStats.score, tgStats.enemyScore, games.date, games.id, games.mapNum AS mapNumber, games.week,\
                                      maps.name AS mapName, servers.name AS serverName FROM tgStats\
                                      INNER JOIN games ON games.id = tgStats.gameId\
                                      INNER JOIN maps ON maps.id = games.mapId\
                                      INNER JOIN servers ON servers.id = games.serverId\
                                      WHERE tgStats.teamId = ? AND games.week = ?\
                                      ORDER BY mapNum", teamId, matches[i]['week']);
    // get the 4 players in each game
    for(let j = 0; j < matches[i]['games'].length; j++) {
      matches[i]['games'][j]['roster'] = await db.all("SELECT players.id AS playerId, playerNames.name, pgStats.rank FROM games\
                                                    INNER JOIN playerNames ON playerNames.gameId = games.id\
                                                    INNER JOIN players ON players.id = playerNames.playerId\
                                                    INNER JOIN pgStats ON pgStats.gameId = games.id AND pgStats.playerId = players.id\
                                                    WHERE games.id = ? AND players.teamId = ?\
                                                    ORDER BY rank", matches[i]['games'][j]['id'], teamId);
    }
  }

  return matches;
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

  let recentAwards = await db.all("SELECT awards.name, awards.id, awards.description, games.id AS gameId, games.date,\
                                  games.mapNum AS mapNumber, teams.clanTag AS enemyClanTag FROM awardStats\
                                  INNER JOIN awards ON awards.id = awardStats.awardId\
                                  INNER JOIN games ON games.id = awardStats.gameId\
                                  INNER JOIN tgStats ON tgStats.gameId = games.id AND tgStats.teamId = ?\
                                  INNER JOIN teams ON teams.id = tgStats.enemyTeamId\
                                  WHERE playerId = ?\
                                  ORDER BY date DESC\
                                  LIMIT 3", teamId, playerId);

  let recentMatches = await db.all("SELECT games.date, pgStats.gameId, maps.name AS map, pgStats.rank AS playerRank,\
                                    tgStats.score AS teamScore, tgStats.enemyScore AS enemyTeamScore FROM games\
                                    INNER JOIN pgStats ON pgStats.gameId = games.id\
                                    INNER JOIN tgStats ON tgStats.gameId = games.id\
                                    INNER JOIN maps ON games.mapId = maps.id\
                                    WHERE pgStats.playerId = ? AND tgSTats.teamId = ?\
                                    ORDER BY games.date DESC\
                                    LIMIT 4", playerId, teamId);

  // console.log                                    

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

export async function getGameInfo(gameId: string): Promise<GameInfo | null> {
  if(!db) {
    console.log('connecting to database');
    db = await open({
      filename: './stats.db',
      driver: sqlite3.Database,
    });
  }

  // check if this gameId exists before doing anything
  let validGameId = await db.get("SELECT EXISTS(\
                                      SELECT 1 FROM games\
                                      WHERE id == ?\
                                    ) AS valid", gameId);
  if(validGameId['valid'] == 0) { // stop now
    console.error(`Ignoring invalid gameId: ${gameId}`);
    return null;
  }



  let basicInfo = await db.get("SELECT games.date, games.mapNum, maps.name AS mapName, servers.name AS server FROM games\
                              INNER JOIN maps ON maps.id = games.mapId\
                              INNER JOIN servers ON servers.id = games.serverId\
                              WHERE games.id = ?", gameId);
  console.log('TEST');
  console.log(basicInfo);
  
  let teams = await db.all("SELECT tgStats.teamId, teams.name AS teamName, teams.clanTag, tgStats.score, tgstats.color FROM tgStats\
                          INNER JOIN teams ON teams.id = tgStats.teamId\
                          WHERE tgStats.gameId = ?\
                          ORDER BY color DESC", gameId);

  for(let i = 0; i < 2; i++) {
    let teamPlayers = await db.all("SELECT players.id AS playerId, playerNames.name AS playerName, pgStats.score, pgStats.kills,\
                                  pgStats.deaths, pgStats.damageDealt, pgStats.damageTaken FROM players\
                                  INNER JOIN pgStats ON pgStats.playerId = players.id\
                                  INNER JOIN playerNames ON playerNames.playerId = players.id AND playerNames.gameId = ?\
                                  WHERE pgStats.gameId = ? AND players.teamId = ?\
                                  ORDER BY score DESC", gameId, gameId, teams[i]['teamId']);
    for(let j = 0; j < teamPlayers.length; j++) {
      let weaponStats = await db.all("SELECT weaponName, damage, kills, shotsFired, shotsHit,\
                                      round(CAST(shotsHit AS float) / shotsFired * 100) AS accuracy FROM pwStats\
                                    WHERE gameId = ? AND playerId = ?", gameId, teamPlayers[j]['playerId']);
      teamPlayers[j]['weapons'] = weaponStats;
    }

    teams[i]['players'] = teamPlayers;
  }


  let answer: GameInfo = {
    mapName: basicInfo['mapName'],
    mapNumber: basicInfo['mapNum'],
    server: basicInfo['server'],
    date: basicInfo['date'],
    teams: teams,
  };

  return answer;
}

export async function getPlayerAwards(playerId: string): Promise<PlayerAward[] | null> {
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

  let awards = await db.all("SELECT awards.id, awards.name, awards.description, COUNT(awardStats.playerId) AS amountEarned, (\
                              SELECT COUNT(1) FROM awardStats WHERE awardId = awards.id\
                            ) AS totalEarned, (\
                              SELECT COUNT(DISTINCT playerId) FROM awardStats WHERE awardId = awards.id\
                            ) AS playersEarned FROM awards\
                            LEFT JOIN awardStats ON awards.id = awardStats.awardId AND awardStats.playerId = ?\
                            GROUP BY awards.id\
                            ORDER BY amountEarned DESC, awards.name", playerId);
  return awards;
}

// this data is for the /player/matches page, NOT the /player/summary page
// TODO: combine them?
export async function getPlayerRecentMatches(playerId: string, teamId: string): Promise<PlayerRecentMatch[] | null> {
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

  let test = await db.all("SELECT pgStats.gameId, pgStats.score, pgStats.rank, games.date, games.mapNum AS mapNumber, maps.name AS mapName,\
                          pgStats.kills, pgStats.deaths, pgStats.damageDealt, pgStats.damageTaken,\
                          tgStats.score AS teamScore, tgStats.enemyScore AS enemyTeamScore, tgStats.enemyTeamId, teams.name AS enemyTeamName,\
                          servers.name AS serverName FROM pgStats\
                          INNER JOIN games ON pgStats.gameId = games.id\
                          INNER JOIN maps ON games.mapId = maps.id\
                          INNER JOIN tgStats ON pgStats.gameId = tgStats.gameId\
                          INNER JOIN servers ON games.serverId = servers.id\
                          INNER JOIN teams ON tgStats.enemyTeamId = teams.id\
                          WHERE playerId = ? AND tgStats.teamId = ?\
                          ORDER BY date DESC", playerId, teamId);

  return test;
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

export async function getAllGameIds() {
  if(!db) {
    console.log('connecting to database');
    db = await open({
      filename: './stats.db',
      driver: sqlite3.Database,
    });
  }
  let answer = await db.all("SELECT id FROM games");
  return answer;
}