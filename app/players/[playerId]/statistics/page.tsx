import { notFound } from 'next/navigation';
import styles from './page.module.scss';
import { getAllPlayerIds, getPlayerStatistics } from '@/app/lib/data';
import ImageFallback from '@/app/components/ImageFallback/ImageFallback';
import TeamMapChart from '@/app/components/TeamMapChart/TeamMapChart';

interface IProps {
  params: {
    playerId: string;
  }
}

export default async function PlayerStatistics(props: IProps){
  const statistics = await getPlayerStatistics(props.params.playerId);
  if(!statistics) { notFound(); }

  function formatAvg(num: number): string {
    return Math.floor(num).toLocaleString('en-US');
  }

  return (
    <div className={styles.container}>
      <div className={styles.topContainer}>
        <div className={styles.averages}>
          <h1>Game Averages</h1>
          <ul>
            <li>Average Score: {formatAvg(statistics.generalStats.averageScore)}</li>
            <li>Average Rank: {formatAvg(statistics.generalStats.averageRank)}</li>
            <li>Average Kills: {formatAvg(statistics.generalStats.averageKills)}</li>
            <li>Average Deaths: {formatAvg(statistics.generalStats.averageDeaths)}</li>
            <li>Average Damage Dealt: {formatAvg(statistics.generalStats.averageDamageDealt)}</li>
            <li>Average Damage Taken: {formatAvg(statistics.generalStats.averageDamageTaken)}</li>
            <li></li>
          </ul>
        </div>
        <div className={styles.weaponStats}>
          <h1>whoa</h1>
        </div>
      </div>
      <p>hey</p>
      <TeamMapChart mapStats={statistics.mapStats}/>
    </div>
  );

}

export async function generateStaticParams() {
  const playerIds = await getAllPlayerIds();
  return playerIds.map(x => {
    return {
      playerId: x.id.toString(),
    }
  });
}