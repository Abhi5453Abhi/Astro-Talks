'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

interface AuthButtonProps {
  variant?: 'primary' | 'ghost'
}

export default function AuthButton({ variant = 'primary' }: AuthButtonProps) {
  const { status } = useSession()

  const baseClasses =
    'px-4 py-2 rounded-full font-semibold transition-all border flex items-center justify-center gap-2'

  const variants = {
    primary:
      'bg-white text-slate-900 hover:bg-amber-100 border-transparent shadow-md shadow-amber-500/30',
    ghost: 'bg-transparent text-white border-white/30 hover:border-white/60',
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
        onClick={() => signOut()}
        className={`${baseClasses} ${variants[variant]}`}
      >
        Sign out
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => signIn('google')}
      className={`${baseClasses} ${variants[variant]}`}
    >
      <span>Sign in with Google</span>
    </button>
  )
}
