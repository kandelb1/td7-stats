import { getPlayerList } from '@/app/lib/data';
import styles from './page.module.scss'
import PlayerCard from '../components/PlayerCard/PlayerCard';

export default async function Players() {
  const players = await getPlayerList();
  return (
    <div className={styles.playerList}>
      {players.map(p => {
        return (
          <PlayerCard player={p} key={p.id}/>
        );
      })}
    </div>
  );
}