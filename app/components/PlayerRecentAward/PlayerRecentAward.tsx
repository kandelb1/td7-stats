import styles from './page.module.scss';
import Image from 'next/image';
import Link from 'next/link';

interface IProps {
  name: string;
  description: string;
  gameId: number;
  date: number;
}

export default function PlayerRecentAward(props: IProps) {
  const date = new Date(props.date * 1000);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

  return (
    <div className={styles.awardBox}>
      <Image src='/medal_accuracy.png' width={64} height={64} alt='blah'/>      
      <div className={styles.textBox}>
        <Link href={`/games/${props.gameId}`}><h2>{props.name} <span>(earned {dateStr})</span></h2></Link>
        <p>{props.description}</p>
      </div>
    </div>
  );
}