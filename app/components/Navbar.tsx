'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { createClient } from '@/lib/supabase/client'

export function Navbar() {
  const { user, loading } = useAuth()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <nav className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            🎄 Merry PBL
          </Link>
          <div>로딩 중...</div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-green-800 text-white p-3 sm:p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-lg sm:text-xl font-bold">
          🎄 Merry PBL
        </Link>
        <div className="flex gap-2 sm:gap-4 items-center text-sm sm:text-base">
          <Link
            href="/guestbook"
            className="px-2 sm:px-3 py-2 hover:text-green-200 transition-colors touch-manipulation"
          >
            방명록
          </Link>
          <Link
            href="/manito"
            className="px-2 sm:px-3 py-2 hover:text-green-200 transition-colors touch-manipulation"
          >
            Secret Santa
          </Link>
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                {user.email?.split('@')[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 active:bg-red-800 px-3 sm:px-4 py-2 rounded transition-colors text-sm sm:text-base touch-manipulation min-h-[44px]"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={async () => {
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                  },
                })
              }}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-3 sm:px-4 py-2 rounded transition-colors text-sm sm:text-base touch-manipulation min-h-[44px]"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

