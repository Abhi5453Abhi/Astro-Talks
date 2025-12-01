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
  mood?: string | null // User's current mood: Happy, Sad, Anxious, Calm, Frustrated, Confused, Excited, Tired
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
  mood,
}: DailyHoroscopeRequest): Promise<DailyHoroscopePayload> {
  const languageDescriptor =
    language === 'hindi'
      ? 'Write the horoscope in Hindi (हिंदी) using a warm, supportive tone while keeping the JSON content in UTF-8.'
      : language === 'punjabi'
      ? 'Write the horoscope in Punjabi (ਪੰਜਾਬੀ) using a warm, supportive tone while keeping the JSON content in UTF-8.'
      : 'Write the horoscope in English with a personal, supportive tone.'

  // Determine tone based on mood
  const moodTone = mood ? {
    'Happy': 'warm, energetic, encouraging',
    'Sad': 'gentle, comforting, stabilizing',
    'Anxious': 'calming, grounding, clear',
    'Calm': 'reflective, balanced',
    'Frustrated': 'direct, practical',
    'Confused': 'clarifying, simplifying',
    'Excited': 'encouraging but grounded',
    'Tired': 'soft, restorative',
  }[mood] || 'supportive, personal' : 'supportive, personal'

  // Themes for the day
  const themes = ['relationships', 'inner clarity', 'energy', 'focus', 'patience', 'communication', 'creativity', 'balance']
  const selectedTheme = themes[Math.floor(Math.random() * themes.length)]

  const systemPrompt = `You are a compassionate astrologer creating personalized, mood-adaptive daily horoscopes.
Your responses must ALWAYS feel personal, supportive, and specific without repeating generic astrology clichés.
Return ONLY valid JSON that matches the provided schema.

CRITICAL RULES:
- NO negativity, fear, or cosmic doom
- NO vague clichés like "big changes are coming" or "stars are shifting"
- Keep everything concise and human
- Always reference the zodiac sign once in a natural, non-forced way
- Do NOT mention astrology mechanics (no houses, retrogrades, charts)
- Tone must match the user's mood: ${moodTone}
- Main message must be 2-4 sentences, grounded, not dramatic
- Micro-prediction must be ONE sentence, small and believable
- Action step must be ONE short line, tiny and doable, mood-appropriate`

  const userPrompt = `
Create a personalized daily horoscope for:
- Name: ${name}
- Zodiac Sign: ${zodiacSign}
- Current Mood: ${mood || 'Not specified'}
- Reference Date: ${referenceDate}

${languageDescriptor}

The JSON schema:
{
  "zodiacSign": "${zodiacSign}",
  "date": "${referenceDate}",
  "luckyColors": string[] (2-3 colors),
  "moodOfDay": string (one word mood),
  "luckyNumber": string,
  "luckyTime": string (format: "HH:MM AM/PM"),
  "summary": string (brief 1-2 sentence overview),
  "mainMessage": string (2-4 sentences matching mood tone, focusing on ONE theme: ${selectedTheme}, grounded and personal),
  "microPrediction": string (ONE sentence - something small and believable that may happen today),
  "actionStep": string (ONE short line - tiny, doable, mood-appropriate activity),
  "sections": [
    {
      "title": "Love",
      "score": number (0-100),
      "summary": string (brief, personal)
    },
    {
      "title": "Career",
      "score": number (0-100),
      "summary": string (brief, personal)
    },
    {
      "title": "Money",
      "score": number (0-100),
      "summary": string (brief, personal)
    },
    {
      "title": "Health",
      "score": number (0-100),
      "summary": string (brief, personal)
    },
    {
      "title": "Travel",
      "score": number (0-100),
      "summary": string (brief, personal)
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

IMPORTANT:
- mainMessage: Must match mood tone (${moodTone}), reference ${zodiacSign} naturally once, focus on ${selectedTheme}, be 2-4 sentences, grounded
- microPrediction: ONE sentence, small and believable (e.g., "A conversation clears up a misunderstanding", "A small opportunity appears at work", "You notice someone appreciating your effort")
- actionStep: ONE short line, tiny and doable, appropriate for ${mood || 'general'} mood
- All content must be personal, supportive, and specific to ${name}
- Avoid generic astrology language
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

