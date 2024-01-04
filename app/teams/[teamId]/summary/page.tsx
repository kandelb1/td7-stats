import { getAllTeamIds, getTeamSummary } from '@/app/lib/data';
import styles from './page.module.scss'
import { notFound } from 'next/navigation';
import TeamRosterTable from '@/app/components/TeamRosterTable/TeamRosterTable';

// TODO: write a real component for this once I figure out how matches work
function RecentMatch() {
  return (
    <div className={styles.match}>
      <p>73 to 51</p>
      <p>Win</p>
    </div>
  );
}

interface IProps {
  params: {
    teamId: string;
  }
}

export default async function TeamSummary(props: IProps) {
  const teamSummary = await getTeamSummary(props.params.teamId);
  if(!teamSummary) { notFound(); }
  
  return (
    <div className={styles.container}>
      <div className={styles.generalStats}>
        <h1>General Stats</h1>
        <p><b>Wins / Losses: </b>{teamSummary.wins} / {teamSummary.losses}</p>
        <table>
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
        </table>
      </div>
      <TeamRosterTable teamSummary={teamSummary}/>
      <div className={styles.recentMatchesContainer}>
        <h1>Recent Matches</h1>
        <div className={styles.matches}>
          <RecentMatch/>
          <RecentMatch/>
          <RecentMatch/>
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