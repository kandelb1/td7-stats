'use client'
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';
import { Team } from "@/app/lib/definitions";

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
  const router = useRouter();

  return (
    <div className={styles.teamBox} onClick={() => router.push(`/teams/${team.id}`)}>
      <h1>{team.name}</h1>
      <p>{team.captain}</p>
    </div>
  );
}