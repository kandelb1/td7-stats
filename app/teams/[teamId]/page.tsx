import { getAllTeamIds } from '@/app/lib/data';
import { redirect } from 'next/navigation';

interface IProps{
  params: {
    teamId: string;
  }
}

export default async function Team(props: IProps){
  redirect(`/teams/${props.params.teamId}/summary`);
}

export async function generateStaticParams() {
  const teamIds = await getAllTeamIds();
  console.log('generateStaticParams for /teams/[teamId]/page.tsx');
  return teamIds.map(x => {
    return {
      teamId: x.id.toString(),
    }
  });
}