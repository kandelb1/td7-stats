import { notFound } from 'next/navigation';
import styles from './page.module.scss';
import { getAllPlayerIds, getPlayerAwards } from '@/app/lib/data';
import ImageFallback from '@/app/components/ImageFallback/ImageFallback';

interface IProps {
  params: {
    playerId: string;
  }
}

export default async function PlayerAwards(props: IProps) {
  const awards = await getPlayerAwards(props.params.playerId);
  if(!awards) { notFound(); }
  
  const totalAwardsEarned = awards.map(a => a.amountEarned).reduce((sum, current) => sum += current);

  const playerCount = (await getAllPlayerIds()).length;

  return (
    <div className={styles.awardsContainer}>
      <h1>Total Awards Earned: {totalAwardsEarned}</h1>
      {awards.map(award => {
        const playerPercentage = Math.floor((award.playersEarned / playerCount * 100));
        const awardPercentage = award.totalEarned != 0 ? Math.floor((award.amountEarned / award.totalEarned * 100)) : '0';
        return (
          <div className={`${styles.award} ${award.amountEarned == 0 ? styles.notEarned : ''}`}>
            <div className={styles.awardLeft}>
              <ImageFallback src={`/awards/${award.id}.png`} fallbackSrc={'/medal_accuracy.png'} width={64} height={64} alt='award icon'/>
              <div>
                <h2>{award.name}</h2>
                <p>{award.description}</p>
              </div>
            </div>
            <div className={styles.awardRight}>
              <ul>
                <li>Earned <b>{award.amountEarned}</b> ({awardPercentage}% of {award.totalEarned} total) of this award.</li>
                {/* <li>This award has been earned <b>{award.totalEarned}</b> times in the tournament.</li> */}
                <li><b>{award.playersEarned}</b> players ({playerPercentage}% of total) have earned this award.</li>
              </ul>
            </div>
          </div>
        );
      })}
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