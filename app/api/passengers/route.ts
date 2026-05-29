
import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {

  try {

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {

      return NextResponse.json({ error: 'Email required' }, { status: 400 })

    }

    const client = await clientPromise
    const db = client.db('airline')

    const schedules = await db.collection('schedules').find({

      'bookings.passengerEmail': email
    })
    
    .sort({ departureTime: 1 }).toArray()

    return NextResponse.json(schedules)
  }
  
  catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })

  }

}

