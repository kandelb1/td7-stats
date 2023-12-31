import { getPlayerInfo } from '@/app/lib/data';
import styles from './page.module.scss'
import { notFound, redirect } from 'next/navigation';
import PlayerWeaponChart from '@/app/components/PlayerWeaponChart/PlayerWeaponChart';
import Image from "next/image";

interface IProps{
  params: {
    playerId: string;
  }
}

export default async function Player(props: IProps) {
  redirect(`/players/${props.params.playerId}/summary`);
}