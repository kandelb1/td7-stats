import { getAllTeamIds } from "@/app/lib/data";

interface IProps {
  params: {
    teamId: string;
  }
}

export default async function TeamMatches(props: IProps) {
  return (
    <p>{props.params.teamId}</p>
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