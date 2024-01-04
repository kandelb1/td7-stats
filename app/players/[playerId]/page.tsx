import styles from './page.module.scss'
import { redirect } from 'next/navigation';
import { getAllPlayerIds } from '@/app/lib/data';

interface IProps{
  params: {
    playerId: string;
  }
}

export default async function Player(props: IProps) {
  redirect(`/players/${props.params.playerId}/summary`);
}

export async function generateStaticParams() {
  const playerIds = await getAllPlayerIds();
  console.log('I did getAllPlayerIds, here is what I got: ');
  console.log(playerIds);
  return playerIds.map(x => {
    return {
      playerId: x.id.toString(),
    }
  });
}