import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get all messages for the user, ordered by timestamp
    const result = await query(
      `SELECT id, role, content, timestamp, is_paid 
       FROM messages 
       WHERE user_id = $1 
       ORDER BY timestamp ASC`,
      [userId]
    )

    // Convert database format to frontend format
    const messages = result.rows.map((row) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      timestamp: parseInt(row.timestamp.toString()),
      isPaid: row.is_paid || false,
    }))

    return NextResponse.json({
      success: true,
      messages,
    })
  } catch (error: any) {
    console.error('Error getting messages:', error)
    return NextResponse.json(
      { error: 'Failed to get messages', details: error.message },
      { status: 500 }
    )
  }
}

