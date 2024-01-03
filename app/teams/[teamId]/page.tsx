import { redirect } from 'next/navigation';

interface IProps{
  params: {
    teamId: string;
  }
}

export default async function Team(props: IProps){
  redirect(`/teams/${props.params.teamId}/summary`);
}