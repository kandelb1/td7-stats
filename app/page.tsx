import Image from 'next/image'
import styles from './page.module.scss'
import Link from 'next/link'

export default function Home() {
  return (
    // <main> tag used to be top level here
    <div className={styles.test}>
      <h1>This is the home page.</h1>
      <h2>Home page stuff goes here</h2>
    </div>
  )
}
