import Link from 'next/link';
import './globals.scss'
import styles from './page.module.scss';
import Image from "next/image";
import Navbar from './components/Navbar/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={styles.body}>
        <div className={styles.pageContainer}>
          <header className={styles.header}>
            <div className={styles.topBar}>
              <Link href={'/'}>
                <img src={'/td_top_logo.png'} width={126} height={96} alt={'ql logo'} className={styles.logo}/>
              </Link>
            </div>          
            <Navbar entries={[
              {name: 'Teams', link: '/teams'},
              {name: 'Players', link: '/players'}
              ]}
            />
          </header>
          <div className={styles.topLevelDiv}>
            {children}
          </div>
          <footer className={styles.footer}>
            <Link href="https://twitch.tv/mrgrim" target="_blank"><img src={'/mrgrim.png'} width={82} height={80} alt={'mrgrim twitch'} /></Link>
            <Link href="https://www.thunderdomequake.com"><img src={'/backbutton.png'} width={190} height={80} alt={'Return'} /></Link>
          </footer>
        </div>
      </body>
    </html>
  )
}
