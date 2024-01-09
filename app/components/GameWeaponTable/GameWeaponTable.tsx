'use client'
import { PlayerGameStats, WeaponStats } from '@/app/lib/definitions';
import styles from './page.module.scss';
import { useState } from 'react';
import Link from 'next/link';

const WEAPON_NAMES = ['rl', 'lg', 'rg', 'pg', 'gl', 'sg', 'mg', 'hmg', 'gt'];

enum DisplayOptions {
  Accuracy,
  Kills,
  Damage
}

interface IProps {
  players: PlayerGameStats[];
}

export default function GameWeaponTable(props: IProps) {

  const [display, setDisplay] = useState(DisplayOptions.Damage);

  function displayOptionChanged(value: DisplayOptions) {
    setDisplay(value);
  }

  function getTableValue(weapon: WeaponStats): JSX.Element {
    switch(display) {
      case DisplayOptions.Accuracy:
        if(weapon.shotsFired == 0) {
          return <p></p>;
        }
        return (
          <div className={styles.accuracyBox}>
            <h1>{`${(weapon.shotsHit / weapon.shotsFired * 100).toFixed(0)}%`}</h1>
            <h2>({weapon.shotsHit} / {weapon.shotsFired})</h2>
          </div>
        );
      case DisplayOptions.Kills:
        return <p>{weapon.kills}</p>
      case DisplayOptions.Damage:
        return <p>{weapon.damage}</p>
    }
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.inputBox}>
        <input type='radio' name='tableoptions' id='damage' value={DisplayOptions.Damage}
        checked={display == DisplayOptions.Damage} onChange={() => displayOptionChanged(DisplayOptions.Damage)}/>
        <label htmlFor='damage'>Damage</label>
        <input type='radio' name='tableoptions' id='kills' value={DisplayOptions.Kills}
        checked={display == DisplayOptions.Kills} onChange={() => displayOptionChanged(DisplayOptions.Kills)}/>
        <label htmlFor='kills'>Kills</label>
        <input type='radio' name='tableoptions' id='accuracy' value={DisplayOptions.Accuracy} 
        checked={display == DisplayOptions.Accuracy} onChange={() => displayOptionChanged(DisplayOptions.Accuracy)}/>
        <label htmlFor='accuracy'>Accuracy</label>
      </div>
      <table className={styles.weaponStats}>
        <thead>
          <tr>
            <th>Name</th>
              {WEAPON_NAMES.map(w => {
                return (
                  <th key={w}><img src={`/weapons/${w}.png`} width={16} height={16} alt='weapon icon' />{w.toUpperCase()}</th>
                );
              })}
          </tr>
        </thead>
        <tbody>
          {props.players.map(p => {
            return (
              <tr key={p.playerId}>
                <td><Link href={`/players/${p.playerId}`} dangerouslySetInnerHTML={{__html: p.playerName}}></Link></td>
                {WEAPON_NAMES.map(weaponName => {
                  let weapon = p.weapons.find(w => w.weaponName == weaponName);
                  if(weapon) {
                    return (
                      <td key={weaponName}>{getTableValue(weapon)}</td>
                    );
                  }else {
                    return (
                      <td key={weaponName}></td>
                    );
                  }
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}