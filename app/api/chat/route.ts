import { NextRequest, NextResponse } from 'next/server'
import { generateGuruDevResponse } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { messages, userProfile, isPaidUser, freeReadingUsed, freeChatActive, timeRemaining } = await request.json()

    // Debug logging
    console.log('💬 Chat API Request:')
    console.log('User languages:', userProfile?.languages)
    console.log('Latest message:', messages[messages.length - 1]?.content)
    console.log('Total messages:', messages.length)
    console.log('Free chat active:', freeChatActive)
    console.log('Time remaining:', timeRemaining)

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

    console.log('🤖 AI Response:', response.substring(0, 100) + '...')

    // Don't trigger payment during free chat - only when timer runs out
    // Payment modal should only be shown by the timer logic in ChatInterface
    const requiresPayment = false

    return NextResponse.json({
      message: response,
      requiresPayment,
      isPaidContent: isPaidUser && freeReadingUsed,
    })
  } catch (error: any) {
    console.error('❌ Chat API error:', error)
    
    // Extract error details
    const errorDetails = {
      type: error?.constructor?.name || 'Unknown',
      message: error?.message || 'Unknown error',
      code: error?.code,
      status: error?.status,
    }
    
    console.error('Error Details:', errorDetails)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        errorDetails: errorDetails,
        message: "The cosmic energies are a bit clouded right now... please try again in a moment, dear one.",
        requiresPayment: false,
        isPaidContent: false,
      },
      { status: 500 }
    )
  }
}

