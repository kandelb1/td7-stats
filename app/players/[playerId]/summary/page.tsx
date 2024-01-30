import { getAllPlayerIds, getPlayerSummary, getPlayerTeamId } from '@/app/lib/data';
import styles from './page.module.scss'
import Image from 'next/image';
import { notFound } from 'next/navigation';
import PlayerRecentMatch from '@/app/components/PlayerRecentMatch/PlayerRecentMatch';
import PlayerRecentCompetitor from '@/app/components/PlayerRecentCompetitor/PlayerRecentCompetitor';
import PlayerRecentAward from '@/app/components/PlayerRecentAward/PlayerRecentAward';
import GoodOrBadText from '@/app/components/GoodOrBadText/GoodOrBadText';

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

  const winRate =(playerSummary.wins != 0) ? Math.floor(playerSummary.wins / (playerSummary.wins + playerSummary.losses) * 100) : 0;
  const kdRatio = (playerSummary.deaths != 0) ? (playerSummary.frags / playerSummary.deaths) : playerSummary.frags;
  const accuracy = playerSummary.shots != 0 ? (playerSummary.hits / playerSummary.shots * 100).toFixed(2) : '0';
  const netDamage = playerSummary.damageDealt - playerSummary.damageTaken;


  function commaString(n: number): string {
    return n.toLocaleString('en-US');
  }

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.topContainer}>
        <div className={styles.vitalStats}>
          <h1>Vital Stats</h1>
          <ul>
            <li><b>Wins / Losses: </b>{playerSummary.wins} / {playerSummary.losses} (<GoodOrBadText value={winRate} threshold={50}>{winRate}%</GoodOrBadText> win rate)</li>
            <li><b>Hits / Shots: </b>{commaString(playerSummary.hits)} / {commaString(playerSummary.shots)}</li>
            <li><b>Accuracy: </b>{accuracy}%</li>
            <li><b>Frags / Deaths: </b>{commaString(playerSummary.frags)} / {commaString(playerSummary.deaths)} (<GoodOrBadText value={kdRatio} threshold={1}>{kdRatio.toFixed(2)}</GoodOrBadText> kdr)</li>
            <li><b>Damage Dealt / Taken: </b>{commaString(playerSummary.damageDealt)} / {commaString(playerSummary.damageTaken)} (<GoodOrBadText value={netDamage} threshold={0} notEqualTo={true}>{netDamage.toLocaleString('en-US')}</GoodOrBadText> net)</li>
          </ul>          
        </div>
        <div className={styles.recentAwards}>
          <h1>Recent Awards</h1>
          {playerSummary.recentAwards.length == 0
            ? <div className={styles.noAwards}>
                <p>No recent awards.</p>
              </div>
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