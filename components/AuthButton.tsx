'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

interface AuthButtonProps {
  variant?: 'primary' | 'ghost'
}

export default function AuthButton({ variant = 'primary' }: AuthButtonProps) {
  const { status } = useSession()
  const { userProfile, reset, setCurrentScreen } = useStore()
  const router = useRouter()

  const baseClasses =
    'px-4 py-2 rounded-full font-semibold transition-all border flex items-center justify-center gap-2'

  const variants = {
    primary:
      'bg-white text-slate-900 hover:bg-amber-100 border-transparent shadow-md shadow-amber-500/30',
    ghost: 'bg-transparent text-white border-white/30 hover:border-white/60',
  }

  const handleSignOut = async () => {
    console.log('🚪 Signing out...')
    // Clear local state
    reset()
    // Sign out from NextAuth
    await signOut({ 
      redirect: false,
      callbackUrl: '/' 
    })
    // Reset to start screen
    setCurrentScreen('start')
    // Force page reload to clear all state
    router.push('/')
    router.refresh()
    console.log('✅ Signed out successfully')
  }

  const handleSignIn = async () => {
    console.log('🔐 Signing in with Google...')
    // Sign in with Google
    await signIn('google', {
      callbackUrl: '/',
      redirect: true,
    })
  }

  if (status === 'loading') {
    return (
      <button
        type="button"
        className={`${baseClasses} ${variants[variant]} opacity-70 cursor-not-allowed`}
        disabled
      >
        Loading...
      </button>
    )
  }

  if (status === 'authenticated') {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        className={`${baseClasses} ${variants[variant]}`}
      >
        Sign out
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      className={`${baseClasses} ${variants[variant]}`}
    >
      <span>Sign in with Google</span>
    </button>
  )
}
