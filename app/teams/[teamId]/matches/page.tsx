import { getAllTeamIds, getTeamMatches, getTeamName } from "@/app/lib/data";
import { notFound } from "next/navigation";
import styles from './page.module.scss';
import ImageFallback from "@/app/components/ImageFallback/ImageFallback";
import Link from "next/link";
import GoodOrBadText from "@/app/components/GoodOrBadText/GoodOrBadText";

interface IProps {
  params: {
    teamId: string;
  }
}

export default async function TeamMatches(props: IProps) {

  const teamMatches = await getTeamMatches(props.params.teamId);
  if (!teamMatches) notFound();

  function getVictoryText(score: number, enemyScore: number): string {
    if(score == enemyScore) return 'Tie';
    if(score > enemyScore) return 'Victory';
    return 'Defeat';
  }

  return (
    <div className={styles.matchesContainer}>
      {teamMatches.map(m => {
        return (
          <div className={styles.match}>
            <div className={styles.header}>
              <h1>Week {m.week} Opponent: <Link href={`/teams/${m.enemyTeamId}`}>{m.enemyTeamName}</Link></h1>
              <h2>{m.score} - {m.enemyTeamScore}</h2>
              <h2 className={(m.score > m.enemyTeamScore) ? 'ql2' : 'ql1'}>{getVictoryText(m.score, m.enemyTeamScore)}!</h2>
            </div>
            {m.games.map(g => {
              return (
                <Link href={`/games/${g.id}`} className={styles.game} key={g.id}>
                  <div className={styles.map} style={{backgroundImage: `url('/levelshots/${g.mapName}.jpg')`}}>
                    <h1 className={g.score > g.enemyScore ? styles.win : styles.loss}>{g.score > g.enemyScore ? 'Win' : 'Loss'}</h1>
                    <h2>{g.score}-{g.enemyScore}</h2>
                  </div>
                  <div className={styles.gameInfo}>
                    <h1>Map {g.mapNumber}: {g.mapName}</h1>
                    <p>Server: {g.serverName}</p>
                    {/* <p>{dateStr}</p> */}
                  </div>
                  <div className={styles.roster}>
                    <h1>Roster</h1>
                    {g.roster.map(p => {
                      return (
                        <p dangerouslySetInnerHTML={{__html: p.name}}/>
                      );
                    })}
                  </div>
                </Link>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export async function generateStaticParams() {
  const teamIds = await getAllTeamIds();
  return teamIds.map(x => {
    return {
      teamId: x.id.toString(),
    }
  });
}