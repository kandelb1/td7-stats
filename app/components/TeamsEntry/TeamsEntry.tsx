// import { useRouter } from 'next/navigation';
import styles from './page.module.scss';
import { Team } from "@/app/lib/definitions";
import Image from 'next/image';
import Link from 'next/link';

interface IProps {
  team: Team;
}

// export default function TeamsEntry({
//   team,
// } : {
//   team: Team;
// }) {

export default function TeamsEntry(props: IProps) {
  const team = props.team;

  return (
    <div className={styles.teamBox}>
      <div className={styles.captainBox}>
        <Link href={`/teams/${team.id}`}>
          <h1>{team.name}</h1>
        </Link>
        <p>{team.captain}</p>
      </div>
      <div className={styles.rosterContainer}>
        {team.roster.map(p => {
          return (
            <Link className={styles.playerBox} key={p.id} href={`/players/${p.id}`}>
              <Image src={'/bones_icon.png'} width={64} height={64} alt={'player model icon'}/>
              <p>{p.name}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}