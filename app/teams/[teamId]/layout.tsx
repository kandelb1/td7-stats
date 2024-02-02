import styles from './page.module.scss';
import { notFound } from 'next/navigation';
import { getTeamName } from '@/app/lib/data';
import Navbar from '@/app/components/Navbar/Navbar';

export default async function TeamPageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    teamId: string;
  }
}) {
  const teamName = await getTeamName(params.teamId);
  if(!teamName) { notFound(); }

  return (
    <div className={styles.layoutContainer}>
      <div className={styles.header}>
        <h1>{teamName}</h1>
      </div>      
      <Navbar
        entries={[
          {name: 'Summary', link: `/teams/${params.teamId}/summary`},
          {name: 'Statistics', link: `/teams/${params.teamId}/statistics`},
          {name: 'Matches', link: `/teams/${params.teamId}/matches`},
        ]}
        backgroundColor='rgb(110, 110, 110)'
      />
      {children}
    </div>
  );
}