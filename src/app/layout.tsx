import './globals.css'
import { Hahmlet } from 'next/font/google'

const hahmlet = Hahmlet({
  subsets: ['latin'],
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

export const metadata = {
  title: '돌다리',
  description: '안전한 작업이 되는 그 날 까지, 돌다리!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        />
      </head>
      <body className={hahmlet.className}>{children}</body>
    </html>
  )
}
