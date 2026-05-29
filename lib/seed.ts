import clientPromise from './mongodb'

const airports = [
  { code: 'NZNE', name: 'Dairy Flat Airport', timezone: 'Pacific/Auckland' },
  { code: 'YSSY', name: 'Sydney Airport', timezone: 'Australia/Sydney' },
  { code: 'NZRO', name: 'Rotorua Airport', timezone: 'Pacific/Auckland' },
  { code: 'NZGB', name: 'Claris Airport (Great Barrier Island)', timezone: 'Pacific/Auckland' },
  { code: 'NZCI', name: 'Tuuta Airport (Chatham Islands)', timezone: 'Pacific/Chatham' },
  { code: 'NZTL', name: 'Lake Tekapo Airport', timezone: 'Pacific/Auckland' },
]

const aircraft = [
  { id: 'SJ30i', name: 'SyberJet SJ30i', capacity: 6 },
  { id: 'SF50-1', name: 'Cirrus SF50 (1)', capacity: 4 },
  { id: 'SF50-2', name: 'Cirrus SF50 (2)', capacity: 4 },
  { id: 'HJ-1', name: 'HondaJet Elite (1)', capacity: 5 },
  { id: 'HJ-2', name: 'HondaJet Elite (2)', capacity: 5 },
]

const routes = [
  { flightNumber: 'DF101', origin: 'NZNE', destination: 'YSSY', aircraft: 'SJ30i', price: 850 },
  { flightNumber: 'DF102', origin: 'YSSY', destination: 'NZNE', aircraft: 'SJ30i', price: 850 },
  { flightNumber: 'DF201', origin: 'NZNE', destination: 'NZRO', aircraft: 'SF50-1', price: 180 },
  { flightNumber: 'DF202', origin: 'NZRO', destination: 'NZNE', aircraft: 'SF50-1', price: 180 },
  { flightNumber: 'DF203', origin: 'NZNE', destination: 'NZRO', aircraft: 'SF50-1', price: 180 },
  { flightNumber: 'DF204', origin: 'NZRO', destination: 'NZNE', aircraft: 'SF50-1', price: 180 },
  { flightNumber: 'DF301', origin: 'NZNE', destination: 'NZGB', aircraft: 'SF50-2', price: 220 },
  { flightNumber: 'DF302', origin: 'NZGB', destination: 'NZNE', aircraft: 'SF50-2', price: 220 },
  { flightNumber: 'DF401', origin: 'NZNE', destination: 'NZCI', aircraft: 'HJ-1', price: 420 },
  { flightNumber: 'DF402', origin: 'NZCI', destination: 'NZNE', aircraft: 'HJ-1', price: 420 },
  { flightNumber: 'DF501', origin: 'NZNE', destination: 'NZTL', aircraft: 'HJ-2', price: 310 },
  { flightNumber: 'DF502', origin: 'NZTL', destination: 'NZNE', aircraft: 'HJ-2', price: 310 },
]

// Returns the next occurrence of a given day (0=Sun, 1=Mon, etc.) from a start date
function nextWeekday(from: Date, day: number): Date {
  const d = new Date(from)
  d.setUTCHours(0, 0, 0, 0)
  while (d.getUTCDay() !== day) {
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return d
}

function generateSchedules() {
  const schedules: object[] = []
  const startDate = new Date('2026-05-01')
  const endDate = new Date('2026-08-31')

  // Helper to add a flight on every matching weekday between start and end
  function addWeekly(flightNumber: string, origin: string, destination: string,
    aircraftId: string, price: number, weekday: number,
    departHour: number, departMin: number, arriveHour: number, arriveMin: number) {

    const aircraft = aircraftId
    let d = nextWeekday(startDate, weekday)
    while (d <= endDate) {
      schedules.push({
        flightNumber,
        origin,
        destination,
        aircraft,
        price,
        capacity: aircraft === 'SJ30i' ? 6 : aircraft.startsWith('SF') ? 4 : 5,
        departureTime: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), departHour - 12, departMin)),
        arrivalTime: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), arriveHour - 12, arriveMin)),
        bookings: [],
      })
      d = new Date(d)
      d.setUTCDate(d.getUTCDate() + 7)
    }
  }

  // Sydney (weekly: depart Dairy Flat Friday 10:00 NZST, arrive Sydney ~14:00 AEST)
  // NZST = UTC+12, so 10:00 NZST = 22:00 UTC Thursday
  // AEST = UTC+10, arrive ~14:00 AEST = 04:00 UTC Friday
  let d = nextWeekday(startDate, 5) // Friday
  while (d <= endDate) {
    const dep = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - 1, 22, 0)) // Thu 22:00 UTC = Fri 10:00 NZST
    const arr = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 4, 0))  // Fri 04:00 UTC = Fri 14:00 AEST
    schedules.push({ flightNumber: 'DF101', origin: 'NZNE', destination: 'YSSY', aircraft: 'SJ30i', price: 850, capacity: 6, departureTime: dep, arrivalTime: arr, bookings: [] })
    d.setUTCDate(d.getUTCDate() + 7)
  }

  // Sydney return (depart Sydney Sunday 14:00 AEST, arrive Dairy Flat ~19:00 NZST)
  // 14:00 AEST = 04:00 UTC, arrive 19:00 NZST = 07:00 UTC
  d = nextWeekday(startDate, 0) // Sunday
  while (d <= endDate) {
    const dep = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 4, 0))
    const arr = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 7, 0))
    schedules.push({ flightNumber: 'DF102', origin: 'YSSY', destination: 'NZNE', aircraft: 'SJ30i', price: 850, capacity: 6, departureTime: dep, arrivalTime: arr, bookings: [] })
    d.setUTCDate(d.getUTCDate() + 7)
  }

  // Rotorua: Mon-Fri, morning run depart 07:00, return 08:30
  for (let weekday = 1; weekday <= 5; weekday++) {
    addWeekly('DF201', 'NZNE', 'NZRO', 'SF50-1', 180, weekday, 7, 0, 8, 0)
    addWeekly('DF202', 'NZRO', 'NZNE', 'SF50-1', 180, weekday, 8, 30, 9, 30)
    addWeekly('DF203', 'NZNE', 'NZRO', 'SF50-1', 180, weekday, 16, 30, 17, 30)
    addWeekly('DF204', 'NZRO', 'NZNE', 'SF50-1', 180, weekday, 18, 0, 19, 0)
  }

  // Great Barrier: Mon, Wed, Fri outbound 09:00; return Tue, Thu, Sat 09:00
  for (const weekday of [1, 3, 5]) {
    addWeekly('DF301', 'NZNE', 'NZGB', 'SF50-2', 220, weekday, 9, 0, 9, 45)
  }
  for (const weekday of [2, 4, 6]) {
    addWeekly('DF302', 'NZGB', 'NZNE', 'SF50-2', 220, weekday, 9, 0, 9, 45)
  }

  // Chatham Islands: Tue, Fri outbound 08:00; Wed, Sat return 08:00
  for (const weekday of [2, 5]) {
    addWeekly('DF401', 'NZNE', 'NZCI', 'HJ-1', 420, weekday, 8, 0, 11, 45)
  }
  for (const weekday of [3, 6]) {
    addWeekly('DF402', 'NZCI', 'NZNE', 'HJ-1', 420, weekday, 8, 0, 11, 45)
  }

  // Lake Tekapo: Mon outbound 10:00; Tue return 10:00
  addWeekly('DF501', 'NZNE', 'NZTL', 'HJ-2', 310, 1, 10, 0, 11, 30)
  addWeekly('DF502', 'NZTL', 'NZNE', 'HJ-2', 310, 2, 10, 0, 11, 30)

  return schedules
}

export async function seedDatabase() {
  const client = await clientPromise
  const db = client.db('airline')

  await db.collection('airports').deleteMany({})
  await db.collection('schedules').deleteMany({})

  await db.collection('airports').insertMany(airports)
  await db.collection('schedules').insertMany(generateSchedules())

  console.log('Database seeded successfully!')
}