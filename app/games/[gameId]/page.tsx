import { getAllGameIds, getGameInfo } from "@/app/lib/data";
import styles from './page.module.scss';
import { notFound } from "next/navigation";
import Link from "next/link";
import { TeamGameInfo } from "@/app/lib/definitions";
import GameWeaponTable from "@/app/components/GameWeaponTable/GameWeaponTable";

const WEAPON_NAMES = ['rl', 'lg', 'rg'];

function isWinningTeam(team: TeamGameInfo, teams: TeamGameInfo[]): boolean {
  // kinda stupid but it works
  if(team.teamId != teams[0].teamId) {
    return team.score > teams[0].score;
  }
  return team.score > teams[1].score;
}

interface IProps {
  params: {
    gameId: string;
  }
}

export default async function Game(props: IProps) {

  const gameInfo = await getGameInfo(props.params.gameId);
  if(!gameInfo) { notFound(); }

  const date = new Date(gameInfo.date * 1000);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

  const combinedPlayers = gameInfo.teams[0].players.concat(gameInfo.teams[1].players).sort((a, b) => a.score > b.score ? -1 : 1);

  return (
    <div className={styles.gameContainer}
    /* style={{backgroundImage: `url('/levelshots/${gameInfo.map}.jpg')`}} */>
      <p>{dateStr}</p>
      <p>Server: {gameInfo.server}</p>
      <p>Map: {gameInfo.map}</p>
      <div className={styles.scoreboardContainer}>
        {gameInfo.teams.map(t => {
          return (
            <table className={styles.scoreboard}>
              <caption className={isWinningTeam(t, gameInfo.teams) ? 'ql2' : 'ql1'}>{t.teamName}: {t.score}</caption>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Score</th>
                  <th>K/D</th>
                  <th>Damage</th>
                </tr>
              </thead>
              <tbody>
                {t.players.map(p => {
                  return (
                    <tr key={p.playerId}>
                      <td><Link href={`/players/${p.playerId}`} dangerouslySetInnerHTML={{__html: p.playerName}}></Link></td>
                      <td>{p.score}</td>
                      <td>{p.kills}/{p.deaths}</td>
                      <td>{p.damageDealt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
        })}
      </div>
      <GameWeaponTable players={combinedPlayers}/>
    </div>
  );
}

export async function generateStaticParams() {
  const gameIds = await getAllGameIds();
  return gameIds.map(x => {
    return {
      gameId: x.id.toString(),
    }
  });
}