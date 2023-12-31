import { getPlayerSummary } from '@/app/lib/data';
import styles from './page.module.scss'
import Image from 'next/image';
import { notFound } from 'next/navigation';


function Reward(props: {
  name: string;
  desc: string;
  // image: string
}){
  return (
    <div className={styles.awardBox}>
      <Image src='/medal_accuracy.png' width={64} height={64} alt='blah'/>
      <div className={styles.textBox}>
        <h2>{props.name}</h2>
        <p>{props.desc}</p>
      </div>
    </div>
  );
}

function Match(props: {
  winStatus: string;
  rank: string
}){
  return (
    <div className={styles.match}>
      <Image src={'/ca.png'} width={32} height={32} alt='ca logo'/>
      <p>Finish: {props.rank}</p>
      <p>{props.winStatus}</p>
    </div>
  );
}

function Competitor(props: {
  name: string;
}){
  return (
    <div className={styles.competitor}>
      <Image src={'/bones_icon.png'} width={64} height={64} alt={'bones icon'} />
      <p>{props.name}</p>
    </div>
  );
}

interface IProps {
  params: {
    playerId: string;
  }
}

export default async function PlayerSummary(props: IProps) {
  console.log(`PlayerSummary gets params: ${props.params.playerId}`)
  // since this is a server component, we can do our data fetching here

  const playerSummary = await getPlayerSummary(props.params.playerId);
  if(!playerSummary) notFound();
  console.log(playerSummary);

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.topContainer}>
        <div className={styles.vitalStats}>
          <h1>Vital Stats</h1>
          <p><b>Wins / Losses: </b>{playerSummary.wins} / {playerSummary.losses}</p>
          <p><b>Hits / Shots: </b>{playerSummary.hits} / {playerSummary.shots}</p>
          <p><b>Accuracy: </b>{(playerSummary.hits / playerSummary.shots * 100).toFixed(2)}%</p>
        </div>
        <div className={styles.recentAwards}>
          <h1>Recent Awards</h1>
          <Reward name='LG Master' desc='Finish a match with over 50% LG accuracy.'/>
          <Reward name='Legend' desc='Have at least one kill with PG.'/>
          <Reward name='Ban This Guy' desc='Have at least one shot fired with MG.'/>
        </div>
      </div>
      <div className={styles.recentMatches}>
        <h1>Recent Matches</h1>
        <div className={styles.matchesContainer}>
          <Match rank='1st of 8' winStatus='Win'/>
          <Match rank='3rd of 8' winStatus='Win'/>
          <Match rank='8th of 8' winStatus='Loss'/>
        </div>
      </div>
        <div className={styles.recentCompetitors}>
          <h1>Recent Competitors</h1>
          <div className={styles.competitorsContainer}>
            <Competitor name='Player1'/>
            <Competitor name='Player2'/>
            <Competitor name='Player3'/>
            <Competitor name='Player4'/>
            <Competitor name='Player5'/>
            <Competitor name='Player6'/>
            <Competitor name='Player7'/>
            <Competitor name='Player8'/>
          </div>
        </div>
    </div>
  );
}