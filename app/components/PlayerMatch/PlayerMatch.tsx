'use client'
import { PlayerRecentMatch } from "@/app/lib/definitions";
import styles from './page.module.scss';
import Link from "next/link";
import { useRouter } from "next/navigation";
import GoodOrBadText from "../GoodOrBadText/GoodOrBadText";
import { formatRank } from "@/app/lib/utils";

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

  const damageDealtString = match.damageDealt.toString();
  const damageStr = (match.damageDealt >= 1000) ? `${damageDealtString[0]}.${damageDealtString[1]}k` : match.damageDealt.toString();

  function handleClick(e: any) {
    router.push(`/games/${match.gameId}`);
  }

  function handleTeamClick(e: any) {
    e.stopPropagation();
    router.push(`/teams/${match.enemyTeamId}`);
  }

  return (
    <Link href={`/games/${props.match.gameId}`} className={styles.match} onClick={handleClick}>
        <div className={styles.map} style={{backgroundImage: `url('/levelshots/${match.mapName}.jpg')`}}>
          <h1>{formatRank(match.rank)}</h1>
          <h2 className={match.teamScore > match.enemyTeamScore ? 'ql2' : 'ql1'}>{match.teamScore > match.enemyTeamScore ? 'Win' : 'Loss'}</h2>
        </div>
        <div className={styles.gameInfo}>
          <h1>{match.mapName}</h1>
          <p>{dateStr}</p>
          <p>{match.serverName}</p>
          <p>Map {match.mapNumber} vs. {match.enemyTeamName}</p>
        </div>
        <div className={styles.personalInfo}>
          <h1>Personal</h1>
          <p>Score: {match.score}</p>
          <p>KDR: <span className={kdr >= 1 ? 'ql2' : 'ql1'}>{kdr.toFixed(2)}</span></p>
          <span>Damage: {damageStr} (<GoodOrBadText value={damageNet} threshold={0} notEqualTo={true}>{damageNet}</GoodOrBadText> net) </span>
        </div>
    </Link>
  );
}