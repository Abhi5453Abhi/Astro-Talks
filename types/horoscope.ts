export interface HoroscopeSection {
  title: string
  score: number
  summary: string
}

export interface HoroscopeInsightSection {
  title: string
  content: string
}

export interface HoroscopeInsight {
  title: string
  dateRange: string
  overview: string
  sections: HoroscopeInsightSection[]
}

export interface DailyHoroscopePayload {
  zodiacSign: string
  date: string
  luckyColors: string[]
  moodOfDay: string
  luckyNumber: string
  luckyTime: string
  summary: string
  sections: HoroscopeSection[]
  insights: {
    weekly: HoroscopeInsight
    monthly: HoroscopeInsight
    yearly: HoroscopeInsight
  }
}

export const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const

