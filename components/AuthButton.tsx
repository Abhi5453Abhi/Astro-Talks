// Authentication feature commented out - entire component disabled
'use client'

// import { signIn, signOut, useSession } from 'next-auth/react'
// import { useStore } from '@/lib/store'
// import { useRouter } from 'next/navigation'

// interface AuthButtonProps {
//   variant?: 'primary' | 'ghost'
// }

export default function AuthButton({ variant = 'primary' }: { variant?: 'primary' | 'ghost' }) {
  // Authentication feature commented out - component returns null
  return null
  
  // Original implementation commented out
  // const { status } = useSession()
  // const { userProfile, reset, setCurrentScreen } = useStore()
  // const router = useRouter()
  // ... rest of the component
}
