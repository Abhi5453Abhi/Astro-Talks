import { NextRequest, NextResponse } from 'next/server'
import { generateGuruDevResponse } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { messages, userProfile, isPaidUser, freeReadingUsed, freeChatActive, timeRemaining } = await request.json()

    // Convert messages to OpenAI format
    const chatMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    const response = await generateGuruDevResponse(
      chatMessages,
      userProfile,
      isPaidUser,
      freeReadingUsed,
      freeChatActive,
      timeRemaining
    )

    // Don't trigger payment during free chat - only when timer runs out
    // Payment modal should only be shown by the timer logic in ChatInterface
    const requiresPayment = false

    return NextResponse.json({
      message: response,
      requiresPayment,
      isPaidContent: isPaidUser && freeReadingUsed,
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        message: "The cosmic energies are a bit clouded right now... please try again in a moment, dear one.",
        requiresPayment: false,
        isPaidContent: false,
      },
      { status: 500 }
    )
  }
}

