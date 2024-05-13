import { getAllTeamIds, getTeamSummary } from '@/app/lib/data';
import styles from './page.module.scss'
import { notFound } from 'next/navigation';
import GoodOrBadText from '@/app/components/GoodOrBadText/GoodOrBadText';
import Link from 'next/link';

interface IProps {
  params: {
    teamId: string;
  }
}

export default async function TeamSummary(props: IProps) {
  const teamSummary = await getTeamSummary(props.params.teamId);
  if(!teamSummary) { notFound(); }

  const winRate =(teamSummary.wins != 0) ? Math.floor(teamSummary.wins / (teamSummary.wins + teamSummary.losses) * 100) : 0;
  const kdRatio = (teamSummary.deaths != 0) ? (teamSummary.frags / teamSummary.deaths) : teamSummary.frags;
  const accuracy = teamSummary.shots != 0 ? (teamSummary.hits / teamSummary.shots * 100).toFixed(2) : '0';
  const netDamage = teamSummary.damageDealt - teamSummary.damageTaken;

  function commaString(n: number): string {
    return n.toLocaleString('en-US');
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.generalStats}>
        <h1>General Stats</h1>
        <ul>
          <li><b>Wins / Losses: </b>{teamSummary.wins} / {teamSummary.losses} (<GoodOrBadText value={winRate} threshold={50}>{winRate}%</GoodOrBadText> win rate)</li>
          <li><b>Total Hits / Shots: </b>{commaString(teamSummary.hits)} / {commaString(teamSummary.shots)}</li>
          <li><b>Accuracy: </b>{accuracy}%</li>
          <li><b>Total Frags / Deaths: </b>{commaString(teamSummary.frags)} / {commaString(teamSummary.deaths)} (<GoodOrBadText value={kdRatio} threshold={1}>{kdRatio.toFixed(2)}</GoodOrBadText> kdr)</li>
          <li><b>Total Damage Dealt / Taken: </b>{commaString(teamSummary.damageDealt)} / {commaString(teamSummary.damageTaken)} (<GoodOrBadText value={netDamage} threshold={0} notEqualTo={true}>{netDamage.toLocaleString('en-US')}</GoodOrBadText> net)</li>
        </ul>
        {/* <table>
          <caption>Top 3 Most Played Maps</caption>
          <thead>
            <tr>
              <th>Name</th>
              <th>Games Played</th>
              <th>Win Percentage</th>
            </tr>
          </thead>
          <tbody>
            {teamSummary.mostPlayedMaps.map(m => {
              return (
                <tr key={m.name}>
                  <td>{m.name}</td>
                  <td>{m.totalGames}</td>
                  <td>{m.winPercentage}%</td>
                </tr>
              );
            })}
          </tbody>
        </table> */}
      </div>
      <div className={styles.roster}>
        <h1>Roster</h1>
        <table className={styles.rosterTable}>
          <thead>
            <tr>
              <th>Member</th>
              <th>Games Played</th>
              <th>Wins</th>
              <th>Losses</th>
            </tr>
          </thead>
          <tbody>
            {teamSummary.roster.map(p => {
              return (
                <tr key={p.id}>
                    <td><Link href={`/players/${p.id}`}>{p.name}</Link></td>
                    <td>{p.gamesPlayed}</td>
                    <td>{p.wins}</td>
                    <td>{p.losses}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={styles.recentMatchesContainer}>
        <h1>Recent Matches</h1>
        <div className={styles.matches}>
          {teamSummary.recentMatches.map(m => {
            return (
              <div className={`${styles.match} ${teamSummary.division == 1 ? styles.redBg : styles.blueBg}`}>
                <h1>{m.clanTag}</h1>
                <p>{m.score} to {m.enemyTeamScore}</p>
                <p>{m.score > m.enemyTeamScore ? 'Win' : 'Loss'}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  const teamIds = await getAllTeamIds();
  return teamIds.map(x => {
    return {
      teamId: x.id.toString(), // TODO: maybe teamIds and playerIds should be strings in the first place
    }
  });
}