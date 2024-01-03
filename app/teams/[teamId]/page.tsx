import { getTeamInfo } from '@/app/lib/data';
import styles from './page.module.scss'
import TeamMapChart from '@/app/components/TeamMapChart/TeamMapChart';
import { notFound } from 'next/navigation';
import TeamServerChart from '@/app/components/TeamServerChart/TeamServerChart';

interface IProps{
  params: {
    teamId: string;
  }
}

export default async function Team(props: IProps){
  const teamInfo = await getTeamInfo(props.params.teamId);
  if(!teamInfo) { notFound(); }
  console.log(teamInfo);
  
  return (
    <div className={styles.container}>
      <h1>{teamInfo.teamName}</h1>
      <table className={styles.rosterTable}>
        <caption>Roster</caption>
        <thead>
          <tr>
            <th>Member</th>
            <th>Games Played</th>
            <th>Wins</th>
            <th>Losses</th>
          </tr>
        </thead>
        <tbody>
          {teamInfo.rosterStats.map(p => {
            return (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.gamesPlayed}</td>
                <td>{p.wins}</td>
                <td>{p.losses}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <TeamMapChart teamInfo={teamInfo} />
      <TeamServerChart teamInfo={teamInfo}/>
    </div>
  )
}