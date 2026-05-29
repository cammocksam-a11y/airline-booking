
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

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

function BookingContent() {

  const searchParams = useSearchParams()
  const router = useRouter()

  const flightId = searchParams.get('flightId')

  const [flight, setFlight] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState<any>(null)

  useEffect(() => {

    if (!flightId) return
    fetch(`/api/schedules?id=${flightId}`)
      .then(r => r.json())
      .then(data => {
        const found = Array.isArray(data) ? data[0] : data
        setFlight(found)
        setLoading(false)

      })


  }, [flightId])

  async function handleBooking() {

    if (!name.trim() || !email.trim()) {
      setError('Please enter your name and email.')

      return

    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.')

      return
    
    }
    
    
    setError('')
    setSubmitting(true)

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({

        scheduleId: flightId,
        passengerName: name,
        passengerEmail: email,

      }),

    })

    const data = await res.json()
    if (!res.ok) {

      setError(data.error || 'Booking failed.')
      setSubmitting(false)
      return

    }

    setConfirmation(data)
    setSubmitting(false)

  }

  if (loading) return (

    <div className="max-w-2xl mx-auto px-6 py-12 text-center text-slate-500">
      Loading flight details...
    </div>

  )

  if (!flight) return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-center text-slate-500">
      Flight not found.
    </div>

  )

  // Confirmation Page
  if (confirmation) {

    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-md p-8 border border-slate-100">
          <div className="text-center mb-8">

            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-slate-800">Booking Confirmed!</h1>
            <p className="text-slate-500 mt-2">Your booking reference is:</p>
           
            <div className="text-3xl font-mono font-bold text-sky-600 mt-2">
              {confirmation.bookingRef}
            </div>

            <p className="text-slate-400 text-sm mt-1">Save this reference to manage your booking</p>
          </div>

          <hr className="my-6 border-slate-200" />

          <h2 className="text-lg font-bold text-slate-700 mb-4">Flight Details</h2>
          <div className="space-y-3 text-slate-600">

            <div className="flex justify-between">
              <span className="font-medium">Flight</span>
              <span>{flight.flightNumber} · {getAircraftName(flight.aircraft)}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">From</span>
              <span>{airports[flight.origin]} ({flight.origin})</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">To</span>
              <span>{airports[flight.destination]} ({flight.destination})</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Departure</span>
              <span>{formatDateTime(flight.departureTime, getTimezone(flight.origin))}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Arrival</span>
              <span>{formatDateTime(flight.arrivalTime, getTimezone(flight.destination))}</span>
            </div>


          </div>

          <hr className="my-6 border-slate-200" />

          <h2 className="text-lg font-bold text-slate-700 mb-4">Passenger</h2>
          <div className="space-y-3 text-slate-600">

            <div className="flex justify-between">
              <span className="font-medium">Name</span>
              <span>{confirmation.passenger.passengerName}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Email</span>
              <span>{confirmation.passenger.passengerEmail}</span>
            </div>

          </div>

          <hr className="my-6 border-slate-200" />

          <div className="flex justify-between items-center text-xl font-bold text-slate-800">
            <span>Total Paid</span>
            <span className="text-sky-600">${flight.price}.00</span>
          </div>

          <div className="mt-8 flex gap-4 justify-center">

            <button
              onClick={() => router.push('/search')}
              className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Search More Flights
            </button>

            <button
              onClick={() => router.push('/my-bookings')}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              My Bookings
            </button>

          </div>
        </div>
      </div>

    )

  }


  const seatsLeft = flight.capacity - flight.bookings.length

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Book Flight</h1>

      {/* Flight Summary */}
      <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-200">
        <h2 className="font-bold text-slate-700 mb-3">Flight Summary</h2>
        <div className="space-y-2 text-slate-600 text-sm">


          <div className="flex justify-between">
            <span className="font-medium">Flight</span>
            <span>{flight.flightNumber} · {getAircraftName(flight.aircraft)}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Route</span>
            <span>{airports[flight.origin]} → {airports[flight.destination]}</span>
          </div>


          <div className="flex justify-between">
            <span className="font-medium">Departure</span>
            <span>{formatDateTime(flight.departureTime, getTimezone(flight.origin))}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Arrival</span>
            <span>{formatDateTime(flight.arrivalTime, getTimezone(flight.destination))}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Seats Available</span>
            <span className={seatsLeft <= 1 ? 'text-red-500 font-bold' : ''}>{seatsLeft}</span>
          </div>

          <div className="flex justify-between text-base font-bold text-slate-800 pt-2 border-t border-slate-200 mt-2">
            <span>Price</span>
            <span className="text-sky-600">${flight.price}.00</span>
          </div>

        </div>
      </div>

      {/* Passenger Form */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
        <h2 className="font-bold text-slate-700 mb-4">Passenger Details</h2>
        <div className="space-y-4">
          
          <div>

            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Jane Smith"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div>

            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. jane@example.com"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />

          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleBooking}
            disabled={submitting || seatsLeft === 0}
            className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-300 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {submitting ? 'Confirming...' : `Confirm Booking — $${flight.price}.00`}
          </button>


        </div>
      </div>

    </div>

  )

}


export default function BookingPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading...</div>}>
      <BookingContent />
    </Suspense>

  )

}

