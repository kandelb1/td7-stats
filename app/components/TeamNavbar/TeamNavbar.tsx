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
  teamId: string;
}

export default function TeamNavbar(props: IProps) {
  const pathname = usePathname();

  return (
    <div className={styles.navBar}>
      <Link href={`/teams/${props.teamId}/summary`} className={`${styles.link} ${matchPathname(pathname, 'summary/')}`}>Summary</Link>
      <Link href={`/teams/${props.teamId}/statistics`} className={`${styles.link} ${matchPathname(pathname, 'statistics/')}`}>Statistics</Link>
      <Link href={`/teams/${props.teamId}/matches`} className={`${styles.link} ${matchPathname(pathname, 'matches/')}`}>Matches</Link>
    </div>
  );
}