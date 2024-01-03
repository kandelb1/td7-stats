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