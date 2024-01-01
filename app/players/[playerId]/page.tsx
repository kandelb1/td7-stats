import styles from './page.module.scss'
import { redirect } from 'next/navigation';

interface IProps{
  params: {
    playerId: string;
  }
}

export default async function Player(props: IProps) {
  redirect(`/players/${props.params.playerId}/summary`);
}