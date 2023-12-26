'use client'
import { Player } from "@/app/lib/definitions";
import styles from './page.module.scss';
import { useRouter } from "next/navigation";
import Image from "next/image";

interface IProps {
  player: Player;
}

export default function PlayerCard(props: IProps) {
  const player = props.player;
  const router = useRouter();

  return (
    <div className={styles.playerBox} onClick={() => router.push(`/players/${player.id}`)}>
      <Image src='/placeholder_playercard.png' width='200' height='200' alt='player card image'/>
    </div>
  );
}