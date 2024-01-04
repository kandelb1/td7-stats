import TeamNavbar from '@/app/components/TeamNavbar/TeamNavbar';
import styles from './page.module.scss';
import { notFound } from 'next/navigation';
import { getTeamName } from '@/app/lib/data';

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
      <h1>{teamName}</h1>
      <TeamNavbar teamId={params.teamId}/>
      {children}
    </div>
  );
}