import { notFound } from 'next/navigation';
import styles from './page.module.scss';
import { getAllPlayerIds, getPlayerRecentMatches, getPlayerTeamId } from '@/app/lib/data';
import PlayerMatch from '@/app/components/PlayerMatch/PlayerMatch';

interface IProps {
  params: {
    playerId: string;
  }
}

export default async function PlayerMatches(props: IProps) {

  const teamId = await getPlayerTeamId(props.params.playerId);
  if(!teamId) notFound();

  const matches = await getPlayerRecentMatches(props.params.playerId, teamId);
  if(!matches) notFound();
  
  console.log(matches);

  return (
    <div className={styles.matchesContainer}>
      {matches.length == 0
      ? <h1 className={styles.noData}>No matches played yet.</h1>
      : matches.map(m => {        
        return (
          <PlayerMatch match={m}/>
        );
      })}
    </div>
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