import PlayerNavbar from '@/app/components/PlayerNavbar/PlayerNavbar';
import styles from './page.module.scss';
import { notFound } from 'next/navigation';
import { getPlayerInfo } from '@/app/lib/data';

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
      <PlayerNavbar playerId={params.playerId}/>
      {/* 
      import PlayerContextProvider from './blahblah';
      <PlayerContextProvider>
        {children}
      </PlayerContextProvider> */}
      {children}
    </div>
  );
}