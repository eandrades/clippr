import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clippr — Sistema de reservas para peluquerías',
  description: 'Gestiona tu peluquería: citas, clientes y barberos en un solo lugar.',
  openGraph: {
    title: 'Clippr',
    description: 'Sistema de reservas para peluquerías modernas.',
    siteName: 'Clippr',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
