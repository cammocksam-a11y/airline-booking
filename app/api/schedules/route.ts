
import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {

  try {

    const { searchParams } = new URL(request.url)

    const orig = searchParams.get('orig')
    const dest = searchParams.get('dest')
    const date1 = searchParams.get('date1')
    const date2 = searchParams.get('date2')
    const id = searchParams.get('id')

    const client = await clientPromise
    const db = client.db('airline')

    if (id) {

      const schedule = await db.collection('schedules').findOne({
        _id: new ObjectId(id)

      })

      return NextResponse.json(schedule)
    }

    const query: Record<string, unknown> = {}
    if (orig) query.origin = orig
    if (dest) query.destination = dest
    if (date1 && date2) {

      query.departureTime = {

        $gte: new Date(date1),
        $lte: new Date(date2 + 'T23:59:59Z'),

      }

    }

    const schedules = await db

      .collection('schedules')
      .find(query)
      .sort({ departureTime: 1 })
      .toArray()

    return NextResponse.json(schedules)
  } 
  
  catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })

  }

}

