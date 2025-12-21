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
  id?: string
  name: string
  dateOfBirth?: string
  birthTime?: string
  gender?: string
  languages: ('english' | 'hindi' | 'punjabi')[]
  zodiacSign?: string
  placeOfBirth?: string
  mobile?: string
}

export type Screen =
  | 'start'
  | 'onboarding'
  | 'home'
  | 'chat'
  | 'call'
  | 'free-chat'
  | 'free-chat-option'
  | 'daily-horoscope'
  | 'free-kundli'
  | 'kundli-matching'
  | 'remedies'
  | 'free-services'
  | 'my-sessions'

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
  incomingCall: { callerId: string; callerName: string } | null
  setIncomingCall: (call: { callerId: string; callerName: string } | null) => void
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
  syncFromDatabase: () => Promise<void>
  syncMessagesToDatabase: () => Promise<void>
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
      walletBalance: 0,
      currentScreen: 'start',
      dailyHoroscope: null,
      dailyHoroscopeDate: null,
      dailyHoroscopeCache: {},
      incomingCall: null,
      setIncomingCall: (call) => set({ incomingCall: call }),
      setUserProfile: (profile) => set((state) => {
        // Only update the profile, don't change screen automatically
        // Screen changes should be handled explicitly by the components
        // Don't auto-navigate from start screen - let user click "Start Now" button
        return { userProfile: profile }
      }),
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
          walletBalance: 0,
          currentScreen: 'start',
          dailyHoroscope: null,
          dailyHoroscopeDate: null,
          dailyHoroscopeCache: {},
          incomingCall: null,
        }),
      syncFromDatabase: async () => {
        try {
          // Load user profile from database
          const userResponse = await fetch('/api/users/get', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          if (userResponse.ok) {
            const userData = await userResponse.json()
            if (userData.success && userData.user) {
              // Store user profile with ID if available
              // Use setUserProfile to maintain consistency, but it won't change screen if already on home
              const currentState = useStore.getState()
              if (currentState.userProfile?.id !== userData.user.id || 
                  JSON.stringify(currentState.userProfile) !== JSON.stringify(userData.user)) {
                // Only update if profile actually changed
                set({ userProfile: { ...userData.user, id: userData.user.id } })
              }
            }
          } else {
            console.warn('Failed to sync user profile:', userResponse.status, userResponse.statusText)
          }

          // Load messages from database
          const messagesResponse = await fetch('/api/messages/get', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json()
            if (messagesData.success && messagesData.messages) {
              // Merge database messages with local messages to avoid losing unsaved messages
              set((state) => {
                const dbMessages = messagesData.messages || []
                const localMessages = state.messages || []

                // Create a map of existing messages by ID to avoid duplicates
                const messageMap = new Map<string, Message>()

                // First, add all database messages
                dbMessages.forEach((msg: Message) => {
                  messageMap.set(msg.id, msg)
                })

                // Then, add local messages that aren't in the database (newer/unsaved messages)
                localMessages.forEach((msg: Message) => {
                  if (!messageMap.has(msg.id)) {
                    messageMap.set(msg.id, msg)
                  }
                })

                // Convert map back to array and sort by timestamp
                const mergedMessages = Array.from(messageMap.values()).sort(
                  (a, b) => a.timestamp - b.timestamp
                )

                return { messages: mergedMessages }
              })
            }
          } else {
            console.warn('Failed to sync messages:', messagesResponse.status, messagesResponse.statusText)
          }
        } catch (error) {
          console.error('Error syncing from database:', error)
          // Fallback to localStorage if database fails
        }
      },
      syncMessagesToDatabase: async () => {
        try {
          const state = useStore.getState()
          if (state.messages.length > 0) {
            const saveResponse = await fetch('/api/messages/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ 
                messages: state.messages,
                userId: state.userProfile?.id // Send userId if available
              }),
            })
            if (!saveResponse.ok) {
              const errorData = await saveResponse.json().catch(() => ({}))
              console.error('Error syncing messages to database:', saveResponse.status, errorData)
            }
          }
        } catch (error) {
          console.error('Error syncing messages to database:', error)
        }
      },
    }),
    {
      name: 'astronova-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

