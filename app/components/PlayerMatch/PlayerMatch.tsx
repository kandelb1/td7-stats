'use client'
import { PlayerRecentMatch } from "@/app/lib/definitions";
import styles from './page.module.scss';
import Link from "next/link";
import { useRouter } from "next/navigation";

// TODO: duplicate code 
function formatRank(rank: number): string {
  switch(rank){
    case 1:
      return '1st';
    case 2:
      return '2nd'
    case 3:
      return '3rd'
  }
  return `${rank}th`; // 4-8 is all the same
}

interface IProps {
  match: PlayerRecentMatch;
}

export default function PlayerMatch(props: IProps) {
  const router = useRouter();

  const match = props.match;
  const date = new Date(match.date * 1000);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`// TODO: duplicate code
  const damageNet = match.damageDealt - match.damageTaken;
  const kdr = match.kills / match.deaths;
  


  function handleClick(e: any) {
    router.push(`/games/${match.gameId}`);
  }

  function handleTeamClick(e: any) {
    e.stopPropagation();
    router.push(`/teams/${match.enemyTeamId}`);
  }

  return (
    <div className={styles.match} onClick={handleClick}>
      <div className={styles.match}>
        <div className={styles.map} style={{backgroundImage: `url('/levelshots/${match.mapName}.jpg')`}}>
          <h1>{formatRank(match.rank)}</h1>
          <h2>{match.teamScore > match.enemyTeamScore ? 'Win' : 'Loss'}</h2>
        </div>
        <div className={styles.gameInfo}>
          <h1>{match.mapName}</h1>
          <p>{dateStr}</p>
          <p>{match.serverName}</p>
          <p>Map TODO vs. <span onClick={handleTeamClick}>{match.enemyTeamName}</span></p>
        </div>
        <div className={styles.personalInfo}>
          <h1>Personal</h1>
          <p>Score: {match.score}</p>
          <p>KDR: <span className={kdr >= 1 ? 'ql2' : 'ql1'}>{kdr.toFixed(2)}</span></p>
          <p>Net Damage: <span className={damageNet >= 0 ? 'ql2' : 'ql1'}>{damageNet}</span></p>
        </div>
      </div>
    </div>
  );
}