
'use client'

import { useState } from 'react'
import Link from 'next/link'

const airports = [
  { code: 'NZNE', name: 'Dairy Flat' },
  { code: 'YSSY', name: 'Sydney' },
  { code: 'NZRO', name: 'Rotorua' },
  { code: 'NZGB', name: 'Great Barrier Island' },
  { code: 'NZCI', name: 'Chatham Islands' },
  { code: 'NZTL', name: 'Lake Tekapo' },

]

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

function getTimezone(code: string) {

  if (code === 'YSSY') return 'Australia/Sydney'
  if (code === 'NZCI') return 'Pacific/Chatham'

  return 'Pacific/Auckland'

}

function getAircraftName(id: string) {

  if (id === 'SJ30i') return 'SyberJet SJ30i'
  if (id.startsWith('SF50')) return 'Cirrus SF50'
  if (id.startsWith('HJ')) return 'HondaJet Elite'

  return id

}

export default function SearchPage() {

  const [orig, setOrig] = useState('')
  const [dest, setDest] = useState('')
  const [date1, setDate1] = useState('')
  const [date2, setDate2] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch() {

    if (!orig || !dest || !date1 || !date2) {
      setError('Please fill in all fields.')

      return

    }

    if (orig === dest) {

      setError('Origin and destination cannot be the same.')

      return
    
    }


    setError('')
    setLoading(true)
    setSearched(false)

    const params = new URLSearchParams({ orig, dest, date1, date2 })
    const res = await fetch(`/api/schedules?${params}`)
    const data = await res.json()

    setResults(data)
    setLoading(false)
    setSearched(true)

  }

  const seatsLeft = (flight: any) => flight.capacity - flight.bookings.length

  return (

    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Search Flights</h1>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
         
         
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
            
            <select
              value={orig}
              onChange={e => setOrig(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="">Select origin...</option>
              {airports.map(a => (
                <option key={a.code} value={a.code}>{a.name} ({a.code})</option>
              ))}
            </select>

          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
           
            <select
              value={dest}
              onChange={e => setDest(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >

              <option value="">Select destination...</option>
              {airports.map(a => (
                <option key={a.code} value={a.code}>{a.name} ({a.code})</option>
              ))}
            </select>

          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
            
            <input
              type="date"
              value={date1}
              onChange={e => setDate1(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
           
            <input
              type="date"
              value={date2}
              onChange={e => setDate2(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-sky-500 hover:bg-sky-400 disabled:bg-sky-300 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Searching...' : 'Search Flights'}
        </button>

      </div>

      {/* The Result */}

      {searched && results.length === 0 && (
        <p className="text-slate-500 text-center py-8">No flights found for those dates. Try a wider date range.</p>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">{results.length} flight{results.length !== 1 ? 's' : ''} found</p>
          {results.map((flight) => (

            <div key={flight._id} className="bg-white rounded-xl shadow-md p-6 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>

                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg font-bold text-slate-800">{flight.flightNumber}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600">{getAircraftName(flight.aircraft)}</span>
                  </div>

                  <div className="text-slate-700">
                    <span className="font-medium">{airports.find(a => a.code === flight.origin)?.name}</span>
                    <span className="mx-2 text-sky-500">→</span>
                    <span className="font-medium">{airports.find(a => a.code === flight.destination)?.name}</span>
                  </div>

                  <div className="text-sm text-slate-500 mt-1">
                    Departs: {formatDateTime(flight.departureTime, getTimezone(flight.origin))}
                  </div>

                  <div className="text-sm text-slate-500">
                    Arrives: {formatDateTime(flight.arrivalTime, getTimezone(flight.destination))}
                  </div>

                </div>

                <div className="text-right">
                 
                  <div className="text-2xl font-bold text-sky-600 mb-1">${flight.price}</div>
                 
                  <div className={`text-sm mb-3 ${seatsLeft(flight) <= 1 ? 'text-red-500' : 'text-slate-500'}`}>
                    {seatsLeft(flight)} seat{seatsLeft(flight) !== 1 ? 's' : ''} left
                  </div>
               
                  {seatsLeft(flight) > 0 ? (
                    <Link
                      href={`/booking?flightId=${flight._id}`}
                      className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Book Now
                    </Link>

                  ) : (

                    <span className="bg-slate-200 text-slate-500 font-semibold px-4 py-2 rounded-lg text-sm">
                      Full
                    </span>

                  )}

                </div>
                
              </div>

            </div>

))}
        </div>

      )}

    </div>
  )

}





