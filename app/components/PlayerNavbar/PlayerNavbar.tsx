'use client'
import { usePathname } from 'next/navigation';
import styles from './page.module.scss';
import Link from 'next/link';

function matchPathname(pathname: string, match: string): string {
  if(pathname.endsWith(match)) {
    return styles.active;
  }
  return '';
}

interface IProps {
  playerId: string;
}

export default function PlayerNavbar(props: IProps) {
  const pathname = usePathname();

  return (
    <div className={styles.navBar}>
      <Link href={`/players/${props.playerId}/summary`} className={`${styles.link} ${matchPathname(pathname, 'summary/')}`}>Summary</Link>
      <Link href={`/players/${props.playerId}/statistics`} className={`${styles.link} ${matchPathname(pathname, 'statistics/')}`}>Statistics</Link>
      <Link href={`/players/${props.playerId}/awards`} className={`${styles.link} ${matchPathname(pathname, 'awards/')}`}>Awards</Link>
      <Link href={`/players/${props.playerId}/matches`} className={`${styles.link} ${matchPathname(pathname, 'matches/')}`}>Matches</Link>
    </div>
  );
}