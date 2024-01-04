import { getAllPlayerIds, getPlayerSummary, getPlayerTeamId } from '@/app/lib/data';
import styles from './page.module.scss'
import Image from 'next/image';
import { notFound } from 'next/navigation';
import PlayerRecentMatch from '@/app/components/PlayerRecentMatch/PlayerRecentMatch';
import PlayerRecentCompetitor from '@/app/components/PlayerRecentCompetitor/PlayerRecentCompetitor';


function Reward(props: {
  name: string;
  desc: string;
  // image: string
}){
  return (
    <div className={styles.awardBox}>
      <Image src='/medal_accuracy.png' width={64} height={64} alt='blah'/>
      <div className={styles.textBox}>
        <h2>{props.name}</h2>
        <p>{props.desc}</p>
      </div>
    </div>
  );
}

interface IProps {
  params: {
    playerId: string;
  }
}

export default async function PlayerSummary(props: IProps) {
  // since this is a server component, we can do our data fetching here

  // I can't find a way to pass in teamId as props with the current setup, so we need to do this:
  const teamId = await getPlayerTeamId(props.params.playerId);
  if(!teamId) notFound();

  const playerSummary = await getPlayerSummary(props.params.playerId, teamId);
  if(!playerSummary) notFound();
  console.log(playerSummary);

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.topContainer}>
        <div className={styles.vitalStats}>
          <h1>Vital Stats</h1>
          <p><b>Wins / Losses: </b>{playerSummary.wins} / {playerSummary.losses}</p>
          <p><b>Hits / Shots: </b>{playerSummary.hits} / {playerSummary.shots}</p>
          <p><b>Accuracy: </b>{(playerSummary.hits / playerSummary.shots * 100).toFixed(2)}%</p>
          <p><b>Frags / Deaths: </b>{playerSummary.frags} / {playerSummary.deaths}</p>
          <p><b>Damage Dealt / Taken: </b>{playerSummary.damageDealt} / {playerSummary.damageTaken}</p>
        </div>
        <div className={styles.recentAwards}>
          <h1>Recent Awards</h1>
          <Reward name='LG Master' desc='Finish a match with over 50% LG accuracy.'/>
          <Reward name='Legend' desc='Have at least one kill with PG.'/>
          <Reward name='Ban This Guy' desc='Have at least one shot fired with MG.'/>
        </div>
      </div>
      <div className={styles.recentMatches}>
        <h1>Recent Matches</h1>
        <div className={styles.matchesContainer}>
          {playerSummary.recentMatches.map(m => {
            return (
              <PlayerRecentMatch gameId={m.gameId} playerRank={m.playerRank} map={m.map}
                teamScore={m.teamScore} enemyScore={m.enemyTeamScore} key={m.gameId}/>
            );
          })}
        </div>
      </div>
        <div className={styles.recentCompetitors}>
          <h1>Recent Competitors</h1>
          <div className={styles.competitorsContainer}>
            {playerSummary.recentCompetitors.map(c => {
              return (
                <PlayerRecentCompetitor playerId={c.playerId} playerName={c.name} key={c.playerId}/>
              );
            })}
          </div>
        </div>
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