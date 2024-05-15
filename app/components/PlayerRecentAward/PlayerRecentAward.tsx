import styles from './page.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import ImageFallback from '../ImageFallback/ImageFallback';

interface IProps {
  name: string;
  id: number;
  description: string;
  gameId: string;
  date: number;
  mapNumber: number;
  enemyClanTag: string;
}

export default function PlayerRecentAward(props: IProps) {
  return (
    <div className={styles.awardBox}>
      <ImageFallback src={`/awards/${props.id}.png`} fallbackSrc={'/medal_accuracy.png'} width={64} height={64} alt='award icon'/>
      <div className={styles.textBox}>
        <Link href={`/games/${props.gameId}`}><h2>{props.name} <span>(earned map {props.mapNumber} vs. {props.enemyClanTag})</span></h2></Link>
        <p>{props.description}</p>
      </div>
    </div>
  );
}