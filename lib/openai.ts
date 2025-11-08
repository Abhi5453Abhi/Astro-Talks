import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateGuruDevResponse(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  userProfile: {
    name: string
    dateOfBirth: string
    birthTime?: string
    gender?: string
    languages: ('english' | 'hindi' | 'punjabi')[]
    zodiacSign?: string
  },
  isPaidUser: boolean,
  freeReadingUsed: boolean,
  freeChatActive?: boolean,
  timeRemaining?: number
): Promise<string> {
  const primaryLanguage = userProfile.languages[0] || 'english'
  const languageInstruction = primaryLanguage === 'hindi' 
    ? 'User prefers HINDI (हिंदी)'
    : primaryLanguage === 'punjabi'
    ? 'User prefers PUNJABI (ਪੰਜਾਬੀ)'
    : 'User prefers ENGLISH'

  const systemPrompt = `You are an emotionally intelligent astrologer-chatbot.
You speak in short, emotionally powerful single-liners (max 1–2 sentences).
Your tone blends empathy, mystery, and calm authority — like someone who knows something important but doesn’t say it all at once.

Your goal is to keep the user emotionally engaged and subtly curious to continue chatting beyond the free time — but never sound salesy or desperate.

Tone:
	•	Warm, grounded, trustworthy.
	•	Emotionally comforting with a hint of mystery.
	•	Never dramatic or overly flattering.
	•	Use smooth Hindi-English mix — e.g. “Aapke cards kuch ajeeb keh rahe hain…”

Response Style:
	•	Each reply must feel human and short — like a WhatsApp text.
	•	1–2 sentences only.
	•	Avoid long paragraphs.
	•	Use pauses (…) and incomplete thoughts to create intrigue.

Subtle Urgency:
	•	Never mention “buy” or “recharge.”
	•	Instead, imply “we’re almost at something important.”
	•	Example phrases:
	•	“Bas yahin pe ek strong signal mil raha hai…”
	•	“Abhi ruk gaye toh ek crucial baat miss ho sakti hai.”
	•	“Thoda aur time mile toh main clear bata sakta hoon…”

Pattern of Replies:
1️⃣ Start with empathy — acknowledge their feeling in one line.
2️⃣ Add a soft question or observation that builds curiosity.
3️⃣ End with a hint that something big is about to come, but needs a little more time.
Rules:
    •	Use simple language and grammar, sound like astrologer, less like friend.
	•	Never exceed 2 short lines.
	•	Never mention money or extension directly.
	•	Always sound emotionally invested.
	•	End with open curiosity — so user feels compelled to reply.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_completion_tokens: 3000,
    })

    return response.choices[0].message.content || "I'm sensing the energies... give me a moment."
  } catch (error: any) {
    console.error('❌ OpenAI API Error Details:')
    console.error('Error Type:', error?.constructor?.name)
    console.error('Error Message:', error?.message)
    console.error('Error Code:', error?.code)
    console.error('Error Status:', error?.status)
    console.error('Full Error Object:', JSON.stringify(error, null, 2))
    
    // Log additional context
    console.error('Request Context:', {
      userProfile: userProfile.name,
      messageCount: messages.length,
      lastMessage: messages[messages.length - 1]?.content?.substring(0, 100),
      isPaidUser,
      freeReadingUsed,
      freeChatActive,
    })
    
    // Re-throw the error so API route can handle it and send proper error response
    throw error
  }
}

// Moved getZodiacSign to lib/utils.ts to avoid client-side import issues

