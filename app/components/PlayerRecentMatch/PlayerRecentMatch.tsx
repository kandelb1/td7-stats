import Image from "next/image";
import styles from './page.module.scss';
import ImageFallback from "../ImageFallback/ImageFallback";
import Link from "next/link";
import { formatRank } from "@/app/lib/utils";

interface IProps {
  gameId: string;
  playerRank: number;
  map: string;
  teamScore: number;
  enemyScore: number;
}

export default async function PlayerRecentMatch(props: IProps){
  return (
    <div className={styles.match}>
      <Link href={`/games/${props.gameId}`}>
        <div className={styles.imageContainer}>
          <ImageFallback src={`/levelshots/${props.map}.jpg`} width={192} height={108} alt={'map levelshot'} fallbackSrc={'/levelshots/campgrounds.jpg'} />
          <div className={styles.descriptionContainer}>
            <Image src={'/ca.png'} width={32} height={32} alt='ca logo'/>
            <p>Finish: {formatRank(props.playerRank)}</p>
            <p>{(props.teamScore > props.enemyScore) ? 'Win' : 'Loss'}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}