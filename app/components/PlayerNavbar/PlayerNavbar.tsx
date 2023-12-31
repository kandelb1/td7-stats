'use client'
import { usePathname } from 'next/navigation';
import styles from './page.module.scss';
import { useContext } from 'react';
import Link from 'next/link';

interface IProps {
  playerId: number;
}

function matchPathname(pathname: string, match: string): string {
  if(pathname.endsWith(match)) {
    return styles.active;
  }
  return '';
}

export default function PlayerNavbar(props: IProps) {
  const pathname = usePathname();
  console.log(pathname);
  console.log(props);
  // const { playerId } = useContext();

  return (
    <div className={styles.navBar}>
      <Link href={`/players/${props.playerId}/summary`} className={`${styles.link} ${matchPathname(pathname, 'summary')}`}>Summary</Link>
      <Link href={`/players/${props.playerId}/statistics`} className={`${styles.link} ${matchPathname(pathname, 'statistics')}`}>Statistics</Link>
      <Link href={`/players/${props.playerId}/awards`} className={`${styles.link} ${matchPathname(pathname, 'awards')}`}>Awards</Link>
      <Link href={`/players/${props.playerId}/matches`} className={`${styles.link} ${matchPathname(pathname, 'matches')}`}>Matches</Link>
    </div>
  );
}