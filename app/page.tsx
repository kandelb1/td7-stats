import Image from 'next/image'
import styles from './page.module.scss'
import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <div className={styles.test}>
        <h1>This is the home page.</h1>
        <Link href="/teams">Teams</Link>
        <Link href="/players">Players</Link>
        <Link href="/nowhere">Blah Blah</Link>
      </div>
    </main>
  )
}
