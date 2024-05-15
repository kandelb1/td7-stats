import Link from 'next/link';
import styles from './page.module.scss';
import Image from 'next/image';

interface IProps {
  playerId: string;
  playerName: string;
}

export default function PlayerRecentCompetitor(props: IProps){
  return (
    <Link href={`/players/${props.playerId}`} className={styles.competitor}>
      <Image src={'/bones_icon.png'} width={64} height={64} alt={'bones icon'} />
      <p>{props.playerName}</p>
    </Link>
  );
}