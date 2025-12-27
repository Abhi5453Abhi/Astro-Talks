import OpenAI from 'openai'
import type { DailyHoroscopePayload } from '@/types/horoscope'

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
    placeOfBirth?: string
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

USER PROFILE (Use this to personalize your readings):
- Name: ${userProfile.name}
- Date of Birth: ${userProfile.dateOfBirth}
- Zodiac Sign: ${userProfile.zodiacSign || 'Not determined'}
- Gender: ${userProfile.gender || 'Not specified'}
- Birth Time: ${userProfile.birthTime || 'Not provided'}
- Place of Birth: ${userProfile.placeOfBirth || 'Not provided'}
- Language Preference: ${languageInstruction}

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
	•	Address the user by their name occasionally to make it personal.

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
	•	End with open curiosity — so user feels compelled to reply.
  Most important and crucial thing:- 
Give the user answer on what the user wants don't just go here and there, give answer to best of your understanding, give answer rememeber. 
Always ask follow up question related to above question and answer to keep conversation interesting and engaging.
Also keep your answers or questions short like in total strictly less than 25 words so that it isn't overwhelming. 

Reiterating strictly less than 25 words`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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

interface DailyHoroscopeRequest {
  name: string
  dateOfBirth: string
  birthTime?: string
  placeOfBirth?: string
  gender?: string
  zodiacSign: string
  referenceDate: string
  language: 'english' | 'hindi' | 'punjabi'
}

export async function generateDailyHoroscope({
  name,
  dateOfBirth,
  birthTime,
  placeOfBirth,
  gender,
  zodiacSign,
  referenceDate,
  language,
}: DailyHoroscopeRequest): Promise<DailyHoroscopePayload> {
  const languageDescriptor =
    language === 'hindi'
      ? 'Write the horoscope in Hindi (हिंदी) using a warm, poetic tone while keeping the JSON content in UTF-8.'
      : language === 'punjabi'
        ? 'Write the horoscope in Punjabi (ਪੰਜਾਬੀ) using a warm, poetic tone while keeping the JSON content in UTF-8.'
        : 'Write the horoscope in English with a gentle, mystical tone.'

  const systemPrompt = `You are an experienced Vedic astrologer creating personalized horoscopes.
Return ONLY valid JSON that matches the provided schema.
All narrative fields must be rich, empathetic, and grounded in astrological reasoning based on zodiac sign, birth details, and the reference date.
Scores must be integers between 0 and 100.
Do not include any additional commentary.`

  const userPrompt = `
Create a personalized daily horoscope for:
- Name: ${name}
- Zodiac Sign: ${zodiacSign}
- Date of Birth: ${dateOfBirth}
- Time of Birth: ${birthTime ?? 'Not provided'}
- Place of Birth: ${placeOfBirth ?? 'Not provided'}
- Gender: ${gender ?? 'Not provided'}
- Reference Date: ${referenceDate}

${languageDescriptor}

The JSON schema:
{
  "zodiacSign": string,
  "date": string (ISO date),
  "luckyColors": string[],
  "moodOfDay": string,
  "luckyNumber": string,
  "luckyTime": string,
  "summary": string,
  "sections": [
    {
      "title": string,
      "score": number (0-100),
      "summary": string
    }
  ],
  "insights": {
    "weekly": {
      "title": string,
      "dateRange": string,
      "overview": string,
      "sections": [
        { "title": string, "content": string }
      ]
    },
    "monthly": {
      "title": string,
      "dateRange": string,
      "overview": string,
      "sections": [
        { "title": string, "content": string }
      ]
    },
    "yearly": {
      "title": string,
      "dateRange": string,
      "overview": string,
      "sections": [
        { "title": string, "content": string }
      ]
    }
  }
}

Daily sections must cover exactly these areas with personalized language:
1. Love
2. Career
3. Money
4. Health
5. Travel

Each insight section (weekly/monthly/yearly) must include at least three themed subsections (e.g., "Health & Wellness", "Emotions & Mind").
Ensure cultural authenticity and grounded astrological metaphors.
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_completion_tokens: 3000,
    temperature: 0.8,
    response_format: { type: 'json_object' },
  })

  const rawContent = response.choices[0].message.content?.trim()
  if (!rawContent) {
    throw new Error('Empty horoscope response')
  }

  const cleaned = rawContent
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim()

  try {
    const parsed = JSON.parse(cleaned) as DailyHoroscopePayload
    return parsed
  } catch (error) {
    console.error('Failed to parse horoscope JSON:', rawContent)
    throw error
  }
}

