import { getPlayerList } from '@/app/lib/data';
import styles from './page.module.scss'
import PlayersTable from '../components/PlayersTable/PlayersTable';

export default async function Players() {
  const players = await getPlayerList();
  return (
    <PlayersTable players={players}/>
  );
}