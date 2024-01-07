import Link from 'next/link';
import './globals.scss'
import styles from './page.module.scss';
import Image from "next/image";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={styles.body}>
        <header className={styles.header}>
          <div className={styles.topBar}>
            <Link href={'/'}>
			        <img src={'/td_top_logo.png'} width={126} height={96} alt={'ql logo'} className={styles.logo}/>
            </Link>
            <div className={styles.playerProfile}>
              <p>Welcome back, vajayyjayy.</p>
              <img src={'/placeholder_playercard.png'} width={75} height={75} alt={'playercard'}/>              
            </div>
          </div>          
          <nav className={styles.navBar}>
            <Link href="/teams">Teams</Link>
            <Link href="/players">Players</Link>
            <Link href="/games">Games</Link>
          </nav>
        </header>
        <div className={styles.topLevelDiv}>
          {children}
        </div>
        <footer className={styles.footer}>
          <Link href="https://twitch.tv/mrgrim" target="_blank"><img src={'/mrgrim.png'} width={82} height={80} alt={'mrgrim twitch'} /></Link>
          <Link href="https://www.thunderdomequake.com"><img src={'/backbutton.png'} width={190} height={80} alt={'Return'} /></Link>
        </footer>
      </body>
    </html>
  )
}
