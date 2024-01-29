import { getAllPlayerIds, getPlayerSummary, getPlayerTeamId } from '@/app/lib/data';
import styles from './page.module.scss'
import Image from 'next/image';
import { notFound } from 'next/navigation';
import PlayerRecentMatch from '@/app/components/PlayerRecentMatch/PlayerRecentMatch';
import PlayerRecentCompetitor from '@/app/components/PlayerRecentCompetitor/PlayerRecentCompetitor';
import PlayerRecentAward from '@/app/components/PlayerRecentAward/PlayerRecentAward';

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

  const accuracy = playerSummary.shots != 0 ? (playerSummary.hits / playerSummary.shots * 100).toFixed(2) : '0';

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.topContainer}>
        <div className={styles.vitalStats}>
          <h1>Vital Stats</h1>
          <p><b>Wins / Losses: </b>{playerSummary.wins} / {playerSummary.losses}</p>
          <p><b>Hits / Shots: </b>{playerSummary.hits} / {playerSummary.shots}</p>
          <p><b>Accuracy: </b>{accuracy}%</p>
          <p><b>Frags / Deaths: </b>{playerSummary.frags} / {playerSummary.deaths}</p>
          <p><b>Damage Dealt / Taken: </b>{playerSummary.damageDealt} / {playerSummary.damageTaken}</p>
        </div>
        <div className={styles.recentAwards}>
          <h1>Recent Awards</h1>
          {playerSummary.recentAwards.length == 0
            ? <p>No awards earned.</p>
            : playerSummary.recentAwards.map((award, i)=> {
              return (
                <PlayerRecentAward name={award.name} description={award.description} gameId={award.gameId} date={award.date} key={i}/>
              );
            })
          }
        </div>
      </div>
      <div className={styles.recentMatches}>
        <h1>Recent Matches</h1>
        <div className={styles.matchesContainer}>
          {playerSummary.recentMatches.length == 0 
          ? <div className={styles.noData}>
              <p>No recent matches.</p>
            </div>
          : playerSummary.recentMatches.map(m => {
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
            {playerSummary.recentCompetitors.length == 0
            ? <div className={styles.noData}>
                <p>No recent competitors.</p>
              </div>
            : playerSummary.recentCompetitors.map(c => {
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