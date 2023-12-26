import { getPlayerInfo } from '@/app/lib/data';
import styles from './page.module.scss'
import { notFound } from 'next/navigation';
import PlayerWeaponChart from '@/app/components/PlayerWeaponChart/PlayerWeaponChart';

interface IProps{
  params: {
    playerId: string;
  }
}

export default async function Player(props: IProps) {
  const playerInfo = await getPlayerInfo(props.params.playerId);
  if(!playerInfo) { notFound(); }

  return (
    <div className={styles.player}>
      <h1>I am player id {props.params.playerId}</h1>
      <h2>{playerInfo.name}</h2>
      <PlayerWeaponChart weaponData={playerInfo.totalWeaponStats}/>
    </div>
  );
}