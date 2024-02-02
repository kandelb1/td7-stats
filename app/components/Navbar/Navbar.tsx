'use client'
import styles from './page.module.scss';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function matchPathname(pathname: string, match: string): string {
  if(pathname.includes(match)) { // lets see if this backfires
    return styles.active;
  }
  return '';
}

interface IProps {
  entries: {name: string; link: string}[];
  backgroundColor?: string;
}

export default function Navbar(props: IProps) {
  const pathname = usePathname()
  
  return (
    <nav className={styles.navBar} style={{backgroundColor: props.backgroundColor ? props.backgroundColor : 'rgb(33, 34, 34)'}}>
      {props.entries.map((x, i) => {
        return (
          <Link href={x.link} className={`${matchPathname(pathname, x.link)}`} key={i}>{x.name}</Link>
        );
      })}
    </nav>
  );
}