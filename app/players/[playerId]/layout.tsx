import styles from './page.module.scss';
import { notFound } from 'next/navigation';
import { getPlayerInfo } from '@/app/lib/data';
import Navbar from '@/app/components/Navbar/Navbar';

export default async function PlayerPageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    playerId: string;
  }
}) {

  const playerInfo = await getPlayerInfo(params.playerId);
  if(!playerInfo) { notFound(); }

  return (
    <div className={styles.layoutContainer}>
      <h1>{playerInfo.name} (plays for {playerInfo.teamName})</h1>
      <Navbar entries={[
        {name: 'Summary', link: `/players/${params.playerId}/summary`},
        {name: 'Statistics', link: `/players/${params.playerId}/statistics`},
        {name: 'Awards', link: `/players/${params.playerId}/awards`},
        {name: 'Matches', link: `/players/${params.playerId}/matches`},
        ]}
        backgroundColor='rgb(110, 110, 110)'
      />
      {children}
    </div>
  );
}