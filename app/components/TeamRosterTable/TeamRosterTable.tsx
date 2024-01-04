'use client';
import { TeamSummary } from '@/app/lib/definitions';
import styles from './page.module.scss';
import { useRouter } from 'next/navigation';

interface IProps {
  teamSummary: TeamSummary;
}

export default function TeamRosterTable(props: IProps) {
  const router = useRouter();

  return (
    <table className={styles.rosterTable}>
      <caption>Roster</caption>
      <thead>
        <tr>
          <th>Member</th>
          <th>Games Played</th>
          <th>Wins</th>
          <th>Losses</th>
        </tr>
      </thead>
      <tbody>
        {props.teamSummary.roster.map(p => {
          return (
            <tr key={p.id} onClick={() => router.push(`/players/${p.id}`)}>
                <td>{p.name}</td>
                <td>{p.gamesPlayed}</td>
                <td>{p.wins}</td>
                <td>{p.losses}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}