import './globals.scss'
import styles from './page.module.scss';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className={styles.topLevelDiv}>
          {children}
        </div>
      </body>
    </html>
  )
}
