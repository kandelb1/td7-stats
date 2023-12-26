import { getTeamInfo } from '@/app/lib/data';
import styles from './page.module.scss'
import TeamMapChart from '@/app/components/TeamMapChart/TeamMapChart';
import { notFound } from 'next/navigation';

interface IProps{
  params: {
    teamId: string;
  }
}

export default async function Team(props: IProps){
  const teamInfo = await getTeamInfo(props.params.teamId);
  if(!teamInfo) { notFound(); }
  
  return (
    <div className={styles.chart}>
      <p>hi im teamId {props.params.teamId}</p>
      <TeamMapChart teamInfo={teamInfo} />
    </div>
  )
}