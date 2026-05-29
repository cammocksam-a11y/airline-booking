
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Link from 'next/link'


const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {

  title: 'Dairy Flat Air',
  description: 'Luxury flights from Dairy Flat Airport',

}

export default function RootLayout({
  children,
}: 
{
  children: React.ReactNode

})

{

  return (
    <html lang="en">

      <body className={geist.className}>
        <nav className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          
          <Link href="/" className="text-xl font-bold tracking-wide text-sky-400">
            ✈ Dairy Flat Air
          </Link>

          <div className="flex gap-6 text-sm">

            <Link href="/search" className="hover:text-sky-400 transition-colors">
              Search Flights
            </Link>


            <Link href="/my-bookings" className="hover:text-sky-400 transition-colors">
              My Bookings
            </Link>

          </div>
        </nav>

        <main>{children}</main>


        <footer className="bg-slate-900 text-slate-400 text-center py-4 text-sm mt-12">
          © 2026 Dairy Flat Air. All rights reserved.
        </footer>

      </body>

    </html>
  )

}

