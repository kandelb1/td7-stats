import TeamNavbar from '@/app/components/TeamNavbar/TeamNavbar';
import styles from './page.module.scss';
import { notFound } from 'next/navigation';
import { getTeamInfo } from '@/app/lib/data';

export default async function TeamPageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    teamId: string;
  }
}) {

  const teamInfo = await getTeamInfo(params.teamId);
  if(!teamInfo) { notFound(); }

  return (
    <div className={styles.layoutContainer}>
      <h1>{teamInfo.teamName}</h1>
      <TeamNavbar teamId={params.teamId}/>
      {children}
    </div>
  );
}