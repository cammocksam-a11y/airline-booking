
import Link from 'next/link'

export default function Home() {

  return (

    <div>
      {/* Hero Section */}

      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-white py-24 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          Fly in Luxury from Dairy Flat
        </h1>

        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Private jet experiences to Sydney, Rotorua, Great Barrier Island,
          the Chatham Islands, and Lake Tekapo.
        </p>

        <Link
          href="/search"
          className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors inline-block"
        >
          Search Flights
        </Link>


      </div>

      {/* Routes */}

      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Our Routes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { from: 'Dairy Flat', to: 'Sydney', freq: 'Weekly', aircraft: 'SyberJet SJ30i', seats: 6, emoji: '🇦🇺' },
            { from: 'Dairy Flat', to: 'Rotorua', freq: 'Twice daily, Mon–Fri', aircraft: 'Cirrus SF50', seats: 4, emoji: '🌋' },
            { from: 'Dairy Flat', to: 'Great Barrier Island', freq: '3x weekly', aircraft: 'Cirrus SF50', seats: 4, emoji: '🏝️' },
            { from: 'Dairy Flat', to: 'Chatham Islands', freq: 'Twice weekly', aircraft: 'HondaJet Elite', seats: 5, emoji: '🌊' },
            { from: 'Dairy Flat', to: 'Lake Tekapo', freq: 'Weekly', aircraft: 'HondaJet Elite', seats: 5, emoji: '🏔️' },
          ].map((route) => (
            
            <div key={route.to} className="bg-white rounded-xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-shadow">
              
              <div className="text-3xl mb-3">{route.emoji}</div>
              
              <h3 className="font-bold text-lg text-slate-800">{route.from} → {route.to}</h3>
              
              <p className="text-slate-500 text-sm mt-1">{route.freq}</p>
              
              <p className="text-slate-500 text-sm">{route.aircraft} · {route.seats} seats</p>

              <Link
                href="/search"
                className="mt-4 inline-block text-sky-600 hover:text-sky-500 text-sm font-medium"
              >

                Book now →
              </Link>

            </div>

          ))}


        </div>

      </div>

      {/* My Bookings */}
      <div className="bg-slate-100 py-12 px-6 text-center">
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Already booked?</h2>
        
        <p className="text-slate-500 mb-6">Look up your existing bookings and manage your travel.</p>
        
        <Link
          href="/my-bookings"
          className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors inline-block"
        >
          View My Bookings

        </Link>

      </div>

    </div>


  )


}



