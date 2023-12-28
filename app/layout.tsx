import Link from 'next/link';
import './globals.scss'
import styles from './page.module.scss';
import Image from "next/image";
import localFont from 'next/font/local';


// const handelGothic = localFont({
//   src: './fonts/Handel-Gothic-Regular.ttf',
// });

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
              <Image src={'/ql_top_logo.png'} width={387} height={96} alt={'ql logo'} className={styles.logo}/>
            </Link>            
            <div className={styles.playerProfile}>
              <p>Welcome back, vajayyjayy.</p>
              <Image src={'/placeholder_playercard.png'} width={75} height={75} alt={'playercard'}/>              
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
          <Image src={'/td7_discord_icon.webp'} width={96} height={96} alt={'td7 icon'}/>
          <Image src={'/esrb_t.png'} width={137} height={93} alt={'esrb rating'} />
        </footer>
      </body>
    </html>
  )
}
