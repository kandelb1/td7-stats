import styles from './page.module.scss'
import { getAllPlayerIds } from '@/app/lib/data';

interface IProps {
  params: {
    playerId: string;
  }
}

export default function PlayerStatistics(props: IProps) {
  return (
    <></>
  );
}

export async function generateStaticParams() {
  const playerIds = await getAllPlayerIds();
  return playerIds.map(x => {
    return {
      playerId: x.id.toString(),
    }
  });
}