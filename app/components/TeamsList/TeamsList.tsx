'use client'
import { Team } from '@/app/lib/definitions';
import styles from './page.module.scss';
import TeamsEntry from '../TeamsEntry/TeamsEntry';
import { useState } from 'react';

interface IProps {
  teams: Team[];
}

enum League {
  Red,
  Blue,
}

export default function TeamsList(props: IProps){
  const [league, setLeague] = useState(League.Red);
  const teamsInLeague = props.teams.filter(t => (league == League.Red) ? t.id % 2 == 0 : t.id % 2 == 1); // TODO: replace this when leagues are added to database

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        <input className={`${styles.red} ${league == League.Red ? styles.redSelected : ''}`}
          type='button' value={'Red League'} onClick={() => setLeague(League.Red)}/>
        <input className={`${styles.blue} ${league == League.Blue ? styles.blueSelected : ''}`} 
          type='button' value={'Blue League'} onClick={() => setLeague(League.Blue)}/>
      </div>
      {teamsInLeague.map(t => {
        return (
          <TeamsEntry team={t} key={t.id}/>
        );
      })}
    </div>
  );
}