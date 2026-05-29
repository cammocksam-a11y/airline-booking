
'use client'
import { useState, Suspense } from 'react'

const airports: Record<string, string> = {

  NZNE: 'Dairy Flat',
  YSSY: 'Sydney',
  NZRO: 'Rotorua',
  NZGB: 'Great Barrier Island',
  NZCI: 'Chatham Islands',
  NZTL: 'Lake Tekapo',

}

function getTimezone(code: string) {

  if (code === 'YSSY') return 'Australia/Sydney'
  if (code === 'NZCI') return 'Pacific/Chatham'
  return 'Pacific/Auckland'

}

function formatDateTime(dateStr: string, timezone: string) {

  return new Date(dateStr).toLocaleString('en-NZ', {
    timeZone: timezone,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',

  })

}

function getAircraftName(id: string) {

  if (id === 'SJ30i') return 'SyberJet SJ30i'
  if (id?.startsWith('SF50')) return 'Cirrus SF50'
  if (id?.startsWith('HJ')) return 'HondaJet Elite'
  return id

}

function MyBookingsContent() {

  const [email, setEmail] = useState('')
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [flights, setFlights] = useState<any[]>([])
  
  const [error, setError] = useState('')

  // Canceling

  const [cancelRef, setCancelRef] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelMessage, setCancelMessage] = useState('')
  const [cancelError, setCancelError] = useState('')

  async function handleSearch() {

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')

      return

    }

    setError('')
    setLoading(true)
    setSearched(false)
    setFlights([])

    const res = await fetch(`/api/passengers?email=${encodeURIComponent(email)}`)

    const data = await res.json()
    setFlights(data)
    setLoading(false)
    setSearched(true)

  }

  async function handleCancel() {

    if (!cancelRef.trim()) {
      setCancelError('Please enter a booking reference.')

      return
    
    }

    setCancelError('')
    setCancelMessage('')
    setCancelLoading(true)

    const res = await fetch(`/api/bookings?bookingRef=${cancelRef.trim()}`, {

      method: 'DELETE',

    })

    const data = await res.json()

    if (!res.ok) {
      setCancelError(data.error || 'Cancellation failed.')

    } 
    
    else {

    setCancelMessage(`Booking ${cancelRef.toUpperCase()} has been cancelled.`)
      setCancelRef('')
      
      
      // Refresh flight list IF showing result

      if (searched && email) {
        const res2 = await fetch(`/api/passengers?email=${encodeURIComponent(email)}`)
        const data2 = await res2.json()
        setFlights(data2)

      }

    }

    setCancelLoading(false)
  
}

  // Get booking for passenger flight
  function getPassengerBooking(flight: any) {

    return flight.bookings.find((b: any) =>
      b.passengerEmail.toLowerCase() === email.toLowerCase()
    )
  
}

  return (

    <div className="max-w-3xl mx-auto px-6 py-12">

      <h1 className="text-3xl font-bold text-slate-800 mb-2">My Bookings</h1>
      <p className="text-slate-500 mb-8">Look up your flights or cancel a booking.</p>

      {/* Looking up bookings */}


      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 mb-8">
        <h2 className="font-bold text-slate-700 mb-4">Look Up My Flights</h2>

        <div className="flex gap-3">
     
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Enter your email address"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />


          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-sky-500 hover:bg-sky-400 disabled:bg-sky-300 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
          >

            {loading ? 'Searching...' : 'Search'}
          </button>

        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* The Results */}

      {searched && flights.length === 0 && (
        <p className="text-slate-500 text-center py-6">No bookings found for that email address.</p>

      )}

      {flights.length > 0 && (
        <div className="space-y-4 mb-10">
          <p className="text-slate-600 text-sm">{flights.length} booking{flights.length !== 1 ? 's' : ''} found</p>

          {flights.map((flight) => {
            const booking = getPassengerBooking(flight)
            const isPast = new Date(flight.departureTime) < new Date()
           
            return (
              <div
                key={flight._id}
                className={`bg-white rounded-xl shadow-md p-6 border ${isPast ? 'border-slate-200 opacity-60' : 'border-slate-100'}`}
              >


                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>

                    <div className="flex items-center gap-2 mb-1">

                      <span className="font-bold text-slate-800">{flight.flightNumber}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 text-sm">{getAircraftName(flight.aircraft)}</span>
                      {isPast && (
                        <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">Past</span>
                      )}

                    </div>

                    <div className="text-slate-700 font-medium">
                      {airports[flight.origin]}
                      <span className="mx-2 text-sky-500">→</span>
                      {airports[flight.destination]}
                    </div>


                    <div className="text-sm text-slate-500 mt-1">
                      Departs: {formatDateTime(flight.departureTime, getTimezone(flight.origin))}
                    </div>

                    <div className="text-sm text-slate-500">
                      Arrives: {formatDateTime(flight.arrivalTime, getTimezone(flight.destination))}
                    </div>


                    {booking && (
                      <div className="mt-2 text-sm">
                        <span className="text-slate-500">Booking ref: </span>
                        <span className="font-mono font-bold text-sky-600">{booking.bookingRef}</span>
                      </div>
                    )}

                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-sky-600">${flight.price}</div>
                  </div>
                </div>
              </div>


            )
          })}


        </div>

      )
      }

      {/* Canceling a booking */}

      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
        <h2 className="font-bold text-slate-700 mb-1">Cancel a Booking</h2>
        <p className="text-slate-500 text-sm mb-4">Enter your booking reference to cancel.</p>
        
        <div className="flex gap-3">

          <input
            type="text"
            value={cancelRef}
            onChange={e => setCancelRef(e.target.value.toUpperCase())}
            placeholder="e.g. DF3X9K2A"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          <button
            onClick={handleCancel}
            disabled={cancelLoading}
            className="bg-red-500 hover:bg-red-400 disabled:bg-red-300 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            {cancelLoading ? 'Cancelling...' : 'Cancel'}
          </button>


        </div>
        {cancelError && <p className="text-red-500 text-sm mt-2">{cancelError}</p>}
        {cancelMessage && <p className="text-green-600 text-sm mt-2">✓ {cancelMessage}</p>}
      </div>

    </div>
  )

}

export default function MyBookingsPage() {

  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading...</div>}>
      <MyBookingsContent />
    </Suspense>
  )

}

