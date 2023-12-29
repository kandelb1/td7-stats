import { getPlayerInfo } from '@/app/lib/data';
import styles from './page.module.scss'
import { notFound } from 'next/navigation';
import PlayerWeaponChart from '@/app/components/PlayerWeaponChart/PlayerWeaponChart';
import Image from "next/image";

interface IProps{
  params: {
    playerId: string;
  }
}

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

export default async function Player(props: IProps) {
  const playerInfo = await getPlayerInfo(props.params.playerId);
  if(!playerInfo) { notFound(); }

  return (
    <div className={styles.container}>
      <h1>{playerInfo.name} (plays for {playerInfo.teamName})</h1>
      <div className={styles.navBar}>
        <p>Summary</p>
        <p>Statistics</p>
        <p>Awards</p>
        <p>Matches</p>
      </div>
      <div className={styles.topContainer}>
        <div className={styles.vitalStats}>
          <h1>Vital Stats</h1>
          <p><b>Member Since: </b>Jul. 08, 2008</p>
          <p><b>Time Played: </b>9 games</p>
          <p><b>Wins: </b>421</p>
          <p><b>Losses / Quits: </b>677 / 107</p>
          <p><b>Frags / Deaths:</b>17,336 / 18,860</p>
          <p><b>Hits / Shots: </b>228,382 / 732,898</p>
          <p><b>Accuracy: </b>31.16%</p>
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
      
      {/* <PlayerWeaponChart weaponData={playerInfo.totalWeaponStats}/> */}
    </div>
  );
}