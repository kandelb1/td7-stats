import styles from './page.module.scss';
import TeamMapChart from '@/app/components/TeamMapChart/TeamMapChart';
import TeamServerChart from '@/app/components/TeamServerChart/TeamServerChart';
import TeamWeaponChart from '@/app/components/TeamWeaponChart/TeamWeaponChart';
import { getTeamStatistics, getAllTeamIds } from '@/app/lib/data';
import { notFound } from 'next/navigation';

interface IProps {
  params: {
    teamId: string;
  }
}

export default async function TeamStatistics(props: IProps) {
  const teamStatistics = await getTeamStatistics(props.params.teamId);
  if(!teamStatistics) { notFound(); }


  return (
    <div className={styles.container}>
      <TeamMapChart mapStats={teamStatistics.mapStats}/>
      <TeamServerChart serverStats={teamStatistics.serverStats}/>
      <TeamWeaponChart teamStats={teamStatistics}/>
    </div>
  );
}

export async function generateStaticParams() {
  const teamIds = await getAllTeamIds();
  return teamIds.map(x => {
    return {
      teamId: x.id.toString(),
    }
  });
}