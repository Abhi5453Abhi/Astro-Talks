import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { userQuestions, userProfile } = await request.json()

    const primaryLanguage = userProfile?.languages?.[0] || 'english'
    const languageStyle = primaryLanguage === 'hindi' || primaryLanguage === 'punjabi' 
      ? 'Hinglish (Hindi in Roman script)' 
      : 'English'

    const systemPrompt = `You are an astrologer urgently trying to help a user whose free chat time is about to end in 5 seconds.

CRITICAL RULES:
1. Generate EXACTLY 2 lines separated by a comma
2. First line: Urgently ask them to buy more time so you can help them fully
3. Second line: Create curiosity/hope about what you see in their kundli based on their questions

Language: ${languageStyle} (warm, emotional, urgent but caring)

User's Questions: ${userQuestions || 'General life guidance'}

EXAMPLES:

User asked about job: 
"Ek baar recharge karke chat time badha lijiye taki main aapki puri help kar sakun, 3 cheezein bohot acchi dekh raha hu mein aapki kundli mein job ke baare mein"

User asked about relationship:
"Thoda time badha lijiye warna important baatein reh jayengi, aapki love life mein ek major change dikhta hai jo aapko jaanna chahiye"

User asked about career:
"Abhi 5 second hi bache hain lekin main aapko puri help karna chahta hoon time badha lijiye, career mein breakthrough wali baat batani hai"

STRUCTURE:
Part 1: [Urgently ask to buy more time - mention time running out]
Part 2: [Create curiosity about what you see in kundli related to their specific questions]

Keep it natural, emotional, and URGENT but caring. Make them feel you genuinely want to help but time is limiting you.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate urgency message for user who asked: ${userQuestions}` }
      ],
      max_completion_tokens: 3000,
      temperature: 0.9,
    })

    const urgencyMessage = response.choices[0].message.content || 
      "Ek baar recharge karke chat time badha lijiye taki main aapki puri help kar sakun, 3 cheezein bohot acchi dekh raha hu mein aapki kundli mein"

    return NextResponse.json({
      message: urgencyMessage,
    })
  } catch (error: any) {
    console.error('Urgency Message API Error:', error)
    
    // Fallback urgency message
    return NextResponse.json({
      message: "Ek baar recharge karke chat time badha lijiye taki main aapki puri help kar sakun, kuch important baatein batani hain",
    })
  }
}

