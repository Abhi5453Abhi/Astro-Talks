import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
    try {
        const result = await query(
            'SELECT * FROM astrologers ORDER BY is_online DESC, rating DESC'
        )

        return NextResponse.json({
            success: true,
            astrologers: result.rows,
        })
    } catch (error: any) {
        console.error('Error fetching astrologers:', error)
        return NextResponse.json(
            { error: 'Failed to fetch astrologers', details: error.message },
            { status: 500 }
        )
    }
}
