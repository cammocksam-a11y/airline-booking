
import { seedDatabase } from '@/lib/seed'
import { NextResponse } from 'next/server'

export async function GET() {

  try {
    await seedDatabase()
    return NextResponse.json({ message: 'Database seeded successfully!' })
  } 
  
  catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 })
  }

}

