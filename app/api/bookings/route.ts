
import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'


export async function POST(request: NextRequest) {

  try {
    const body = await request.json()
    const { scheduleId, passengerName, passengerEmail } = body

    const client = await clientPromise
    const db = client.db('airline')

    const schedule = await db.collection('schedules').findOne({
      _id: new ObjectId(scheduleId)

    }
  )

    if (!schedule) {

      return NextResponse.json({ error: 'Flight not found' }, { status: 404 })
    
    }

    if (schedule.bookings.length >= schedule.capacity) {
    
      return NextResponse.json({ error: 'Flight is full' }, { status: 400 })
    
    }

    const bookingRef = 'DF' + Math.random().toString(36).substring(2, 8).toUpperCase()

    const booking = {

      bookingRef,
      passengerName,
      passengerEmail,
      bookedAt: new Date(),

    }

    await db.collection('schedules').updateOne(

      { _id: new ObjectId(scheduleId) },

      { $push: { bookings: booking } } as any

    )

    return NextResponse.json({

      message: 'Booking confirmed',
      bookingRef,
      schedule,
      passenger: { passengerName, passengerEmail }

    })


  }
   catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 })

  }

}


export async function DELETE(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url)
    const bookingRef = searchParams.get('bookingRef')

    const client = await clientPromise
    const db = client.db('airline')

    const result = await db.collection('schedules').updateOne(
      { 'bookings.bookingRef': bookingRef },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { $pull: { bookings: { bookingRef } } } as any
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Booking cancelled successfully' })

  } 
  
  catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Cancellation failed' }, { status: 500 })

  }

}

