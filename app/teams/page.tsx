import styles from './page.module.scss'
import { getTeamsList } from '@/app/lib/data';
import TeamsList from '../components/TeamsList/TeamsList';

export default async function Teams(){
  const teamsList = await getTeamsList();
  
  return (
    <div className={styles.teamsContainer}>
      <TeamsList teams={teamsList}/>
    </div>
  )
}