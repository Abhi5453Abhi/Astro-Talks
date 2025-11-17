import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { messages } = await request.json()

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Save messages in batch
    const savedMessages = []

    for (const message of messages) {
      const { id, role, content, timestamp, isPaid } = message

      if (!id || !role || !content || !timestamp) {
        console.warn('Skipping invalid message:', message)
        continue
      }

      try {
        const result = await query(
          `INSERT INTO messages (id, user_id, role, content, timestamp, is_paid)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) 
           DO UPDATE SET
             content = EXCLUDED.content,
             timestamp = EXCLUDED.timestamp,
             is_paid = EXCLUDED.is_paid
           RETURNING *`,
          [
            id,
            userId,
            role,
            content,
            timestamp,
            isPaid || false,
          ]
        )
        savedMessages.push(result.rows[0])
      } catch (error) {
        console.error('Error saving message:', error, message)
        // Continue with other messages
      }
    }

    return NextResponse.json({
      success: true,
      saved: savedMessages.length,
      messages: savedMessages,
    })
  } catch (error: any) {
    console.error('Error saving messages:', error)
    return NextResponse.json(
      { error: 'Failed to save messages', details: error.message },
      { status: 500 }
    )
  }
}

