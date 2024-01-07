'use client'
import { Player } from '@/app/lib/definitions';
import styles from './page.module.scss';
import { useState } from 'react';
import Link from 'next/link';

interface IProps {
  players: Player[];
}

enum Columns {
  Damage,
  Kills,
  Accuracy,
}

export default function PlayersTable(props: IProps) {

  const [sortedColumn, setSortedColumn] = useState(Columns.Damage);
  const [sortedData, setSortedData] = useState(props.players); // props.players is sorted by damage by default

  function sortingChanged(value: Columns) {
    setSortedColumn(value);
    switch(value) {
      case Columns.Damage:
        setSortedData(props.players.sort((a, b ) => a.damageDealt > b.damageDealt ? -1 : 1));
        break;
      case Columns.Kills:
        setSortedData(props.players.sort((a, b ) => a.kills > b.kills ? -1 : 1));
        break;
      case Columns.Accuracy:
        setSortedData(props.players.sort((a, b ) => a.accuracy > b.accuracy ? -1 : 1));
        break;
    }
  }

  return (
    <div className={styles.playerList}>
      <div className={styles.inputBox}>
        <input type='radio' name='sort' id='damage' checked={sortedColumn == Columns.Damage} onChange={() => sortingChanged(Columns.Damage)}/>
        <label htmlFor='damage'>Sort By Damage</label>
        <input type='radio' name='sort' id='kills' checked={sortedColumn == Columns.Kills} onChange={() => sortingChanged(Columns.Kills)}/>
        <label htmlFor='kills'>Sort By Kills</label>
        <input type='radio' name='sort' id='accuracy' checked={sortedColumn == Columns.Accuracy} onChange={() => sortingChanged(Columns.Accuracy)}/>
        <label htmlFor='Accuracy'>Sort By Accuracy</label>
      </div>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Team</th>
            <th>Damage</th>
            <th>Kills</th>
            <th>Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((p, i) => {
            return (
              <tr key={p.id}>
                <td>#{i + 1}</td>
                <td><Link href={`/players/${p.id}`}><img src='/placeholder_player.png' width={64} height={64} alt='player picture' />{p.name}</Link></td>
                <td><Link href={`/teams/${p.teamId}`}>{p.teamName}</Link></td>
                <td>{p.damageDealt}</td>
                <td>{p.kills}</td>
                <td>{p.accuracy.toFixed(2)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}