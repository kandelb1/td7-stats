import styles from './page.module.scss'
import { getTeamsList } from '@/app/lib/data';
import TeamsEntry from '../components/TeamsEntry/TeamsEntry';

export default async function Teams(){
  const teamsList = await getTeamsList();  
  
  return (
    <div className={styles.teamsList}>
      {teamsList.map(t => {
        return (
          <TeamsEntry team={t} key={t.id}/>
        );
      })}
    </div>
  )
}