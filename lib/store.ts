import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DailyHoroscopePayload } from '@/types/horoscope'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  isPaid?: boolean
}

export interface UserProfile {
  name: string
  dateOfBirth: string
  birthTime?: string
  gender?: string
  languages: ('english' | 'hindi' | 'punjabi')[]
  zodiacSign?: string
  placeOfBirth?: string
}

export type Screen =
  | 'start'
  | 'onboarding'
  | 'home'
  | 'chat'
  | 'free-chat-option'
  | 'daily-horoscope'

interface Store {
  userProfile: UserProfile | null
  messages: Message[]
  freeReadingUsed: boolean
  freeChatClaimed: boolean
  isPaidUser: boolean
  showFreeChatOption: boolean
  freeChatActive: boolean
  freeChatStartTime: number | null
  freeChatExpired: boolean
  walletBalance: number
  currentScreen: Screen
  dailyHoroscope: DailyHoroscopePayload | null
  dailyHoroscopeDate: string | null
  dailyHoroscopeCache: Record<string, DailyHoroscopePayload>
  setUserProfile: (profile: UserProfile) => void
  addMessage: (message: Message) => void
  setFreeReadingUsed: (used: boolean) => void
  setFreeChatClaimed: (claimed: boolean) => void
  setPaidUser: (paid: boolean) => void
  setShowFreeChatOption: (show: boolean) => void
  setFreeChatActive: (active: boolean) => void
  setFreeChatStartTime: (time: number | null) => void
  setFreeChatExpired: (expired: boolean) => void
  setWalletBalance: (balance: number) => void
  setCurrentScreen: (screen: Screen) => void
  setDailyHoroscope: (horoscope: DailyHoroscopePayload | null, date: string | null) => void
  setDailyHoroscopeForSign: (sign: string, horoscope: DailyHoroscopePayload) => void
  removeDailyHoroscopeForSign: (sign: string) => void
  reset: () => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      userProfile: null,
      messages: [],
      freeReadingUsed: false,
      freeChatClaimed: false,
      isPaidUser: false,
      showFreeChatOption: false,
      freeChatActive: false,
      freeChatStartTime: null,
      freeChatExpired: false,
      walletBalance: 346,
      currentScreen: 'start',
      dailyHoroscope: null,
      dailyHoroscopeDate: null,
      dailyHoroscopeCache: {},
      setUserProfile: (profile) => set((state) => ({ 
        userProfile: profile, 
        // Show free chat option only if not claimed yet
        currentScreen: state.freeChatClaimed ? 'home' : 'free-chat-option' 
      })),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setFreeReadingUsed: (used) => set({ freeReadingUsed: used }),
      setFreeChatClaimed: (claimed) => set({ freeChatClaimed: claimed }),
      setPaidUser: (paid) => set({ isPaidUser: paid, freeChatExpired: false }),
      setShowFreeChatOption: (show) => set({ showFreeChatOption: show }),
      setFreeChatActive: (active) => set({ freeChatActive: active }),
      setFreeChatStartTime: (time) => set({ freeChatStartTime: time }),
      setFreeChatExpired: (expired) => set({ freeChatExpired: expired }),
      setWalletBalance: (balance) => set({ walletBalance: balance }),
      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      setDailyHoroscope: (horoscope, date) =>
        set({ dailyHoroscope: horoscope, dailyHoroscopeDate: date }),
      setDailyHoroscopeForSign: (sign, horoscope) =>
        set((state) => ({
          dailyHoroscopeCache: {
            ...state.dailyHoroscopeCache,
            [sign.toLowerCase()]: horoscope,
          },
        })),
      removeDailyHoroscopeForSign: (sign) =>
        set((state) => {
          const updated = { ...state.dailyHoroscopeCache }
          delete updated[sign.toLowerCase()]
          return { dailyHoroscopeCache: updated }
        }),
      reset: () =>
        set({
          userProfile: null,
          messages: [],
          freeReadingUsed: false,
          freeChatClaimed: false,
          isPaidUser: false,
          showFreeChatOption: false,
          freeChatActive: false,
          freeChatStartTime: null,
          freeChatExpired: false,
          walletBalance: 346,
          currentScreen: 'start',
          dailyHoroscope: null,
          dailyHoroscopeDate: null,
          dailyHoroscopeCache: {},
        }),
    }),
    {
      name: 'astro-talks-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

