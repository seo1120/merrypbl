'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

type Participant = {
  id: number
  user_id: string
  joined_at: string
  profiles: {
    nickname: string
  }
}

type Match = {
  id: number
  giver_user_id: string
  receiver_user_id: string
  profiles_receiver: {
    nickname: string
  }
}

type Snowflake = {
  id: number
  left: number
  size: number
  duration: number
  delay: number
  drift: number
}

export default function ManitoPage() {
  const { user, loading } = useAuth()
  const supabase = createClient()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [match, setMatch] = useState<Match | null>(null)
  const [isParticipant, setIsParticipant] = useState(false)
  const [joining, setJoining] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])

  // Generate snowflakes
  useEffect(() => {
    const generateSnowflakes = () => {
      const flakes: Snowflake[] = []
      for (let i = 0; i < 50; i++) {
        const duration = 5 + Math.random() * 10 // 5s ~ 15s
        flakes.push({
          id: i,
          left: Math.random() * 100,
          size: 10 + Math.random() * 30, // 10px ~ 40px
          duration: duration,
          delay: -(Math.random() * duration), // 음수 delay로 이미 진행 중인 것처럼 보이게
          drift: (Math.random() - 0.5) * 40, // -20px ~ 20px 좌우 움직임
        })
      }
      setSnowflakes(flakes)
    }

    generateSnowflakes()
  }, [])

  useEffect(() => {
    if (user) {
      fetchData()
    } else if (!loading) {
      setFetching(false)
    }
  }, [user, loading])

  const fetchData = async () => {
    if (!user) return

    setFetching(true)

    // Check if user is a participant
    const { data: participantData } = await supabase
      .from('manito_participants')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    setIsParticipant(!!participantData)

    // Fetch all participants
    const { data: participantsData } = await supabase
      .from('manito_participants')
      .select(`
        id,
        user_id,
        joined_at,
        profiles:user_id (
          nickname
        )
      `)
      .order('joined_at', { ascending: true })

    if (participantsData) {
      // Transform the data to match the Participant type
      const transformedParticipants: Participant[] = participantsData.map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        joined_at: p.joined_at,
        profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
      }))
      setParticipants(transformedParticipants)
    }

    // Check if user has a match
    const { data: matchData } = await supabase
      .from('manito_matches')
      .select(`
        id,
        giver_user_id,
        receiver_user_id,
        profiles_receiver:receiver_user_id (
          nickname
        )
      `)
      .eq('giver_user_id', user.id)
      .single()

    if (matchData) {
      // Transform the data to match the Match type
      const transformedMatch: Match = {
        id: matchData.id,
        giver_user_id: matchData.giver_user_id,
        receiver_user_id: matchData.receiver_user_id,
        profiles_receiver: Array.isArray(matchData.profiles_receiver)
          ? matchData.profiles_receiver[0]
          : matchData.profiles_receiver,
      }
      setMatch(transformedMatch)
    }

    setFetching(false)
  }

  const handleJoin = async () => {
    if (!user) return

    setJoining(true)
    const { error } = await supabase
      .from('manito_participants')
      .insert({
        user_id: user.id,
      })

    if (error) {
      if (error.code === '23505') {
        alert('이미 참가하셨습니다.')
      } else {
        alert('참가에 실패했습니다: ' + error.message)
      }
      setJoining(false)
      return
    }

    await fetchData()
    setJoining(false)
  }

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading || (fetching && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#303030' }}>
        <p className="text-white">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#303030' }}>
      {/* Snowflakes Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="snowflake"
            style={{
              left: `${flake.left}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              animationDuration: `${flake.duration}s`,
              animationDelay: `${flake.delay}s`,
              '--drift': `${flake.drift}px`,
            } as React.CSSProperties}
          >
            <Image
              src="/svg/snow.svg"
              alt="snow"
              width={flake.size}
              height={flake.size}
              className="w-full h-full"
            />
          </div>
        ))}
      </div>

      {/* Top Button Bar */}
      <div className="relative z-10 flex justify-center p-4">
        <div className="flex gap-4 overflow-x-auto hide-scrollbar w-full justify-center sm:justify-center">
          <Link
            href="/"
            className="bg-primary text-gray-900 px-6 py-2 rounded-[30px] font-['puntino'] text-[18px] sm:text-[20px] touch-manipulation inline-block text-center whitespace-nowrap flex-shrink-0"
          >
            home
          </Link>
          <Link
            href="/guestbook"
            className="bg-primary text-gray-900 px-6 py-2 rounded-[30px] font-['puntino'] text-[18px] sm:text-[20px] touch-manipulation inline-block text-center whitespace-nowrap flex-shrink-0"
          >
            guestbook
          </Link>
          <Link
            href="/manito"
            className="bg-primary text-gray-900 px-6 py-2 rounded-[30px] font-['puntino'] text-[18px] sm:text-[20px] touch-manipulation inline-block text-center whitespace-nowrap flex-shrink-0"
          >
            secret santa
          </Link>
          {user ? (
            <button
              onClick={handleSignOut}
              className="bg-primary text-gray-900 px-6 py-2 rounded-[30px] font-['puntino'] text-[18px] sm:text-[20px] touch-manipulation whitespace-nowrap flex-shrink-0"
            >
              logout
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-primary text-gray-900 px-6 py-2 rounded-[30px] font-['puntino'] text-[18px] sm:text-[20px] touch-manipulation whitespace-nowrap flex-shrink-0"
            >
              login
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 text-center mt-8 mb-8">
        <h1 className="font-['puntino'] text-[42px] text-white leading-tight">
          Secret<br />
          Santa
        </h1>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-8">
        {/* Rules Section */}
        <div className="bg-primary p-6 sm:p-8 rounded-[30px] shadow-lg mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 text-center">
            📋 Rules
          </h2>
          <div className="space-y-3 text-gray-900">
            <div className="flex items-start gap-3">
              <span className="text-lg">1.</span>
              <p className="text-sm sm:text-base flex-1">
                각 참가자는 랜덤으로 배정된 한 명에게 선물을 준비합니다.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">2.</span>
              <p className="text-sm sm:text-base flex-1">
                선물 가격 범위는 <span className="font-bold">$20</span>입니다.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">3.</span>
              <p className="text-sm sm:text-base flex-1">
                매칭 결과는 비밀로 유지되며, 크리스마스 파티(12/17) 당일까지 비밀로 지켜주세요.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">4.</span>
              <p className="text-sm sm:text-base flex-1">
                크리스마스 파티에서 선물을 교환합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Login Required Message */}
        {!user && (
          <div className="bg-primary p-6 sm:p-8 rounded-[30px] shadow-lg text-center mb-6 sm:mb-8">
            <div className="text-5xl sm:text-6xl mb-4">🔒</div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
              로그인이 필요합니다
            </h2>
            <p className="text-gray-900/80 mb-6 text-sm sm:text-base">
              Secret Santa 게임에 참여하려면 로그인해주세요.
            </p>
            <button
              onClick={handleLogin}
              className="bg-gray-900 text-white px-6 py-3 rounded-[30px] hover:bg-gray-800 active:bg-gray-700 text-base font-semibold touch-manipulation min-h-[44px] w-full sm:w-auto"
            >
              Google로 로그인하기
            </button>
          </div>
        )}

        {/* Join Button */}
        {user && !isParticipant && (
          <div className="bg-primary p-6 sm:p-8 rounded-[30px] shadow-lg text-center mb-6 sm:mb-8">
            <p className="text-base sm:text-lg text-gray-900 mb-6">
              Secret Santa 게임에 참가하시겠습니까?
            </p>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="bg-gray-900 text-white px-6 sm:px-8 py-3 rounded-[30px] hover:bg-gray-800 active:bg-gray-700 disabled:bg-gray-400 text-base sm:text-lg font-semibold touch-manipulation min-h-[44px] w-full sm:w-auto"
            >
              {joining ? '참가 중...' : 'Secret Santa 참가하기'}
            </button>
          </div>
        )}

        {/* Waiting Message */}
        {user && isParticipant && !match && (
          <div className="bg-primary p-6 sm:p-8 rounded-[30px] shadow-lg text-center mb-6 sm:mb-8">
            <div className="text-5xl sm:text-6xl mb-4">⏳</div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
              게임 시작을 기다리는 중...
            </h2>
            <p className="text-gray-900/80 mb-4 text-sm sm:text-base">
              현재 {participants.length}명이 참가했습니다.
            </p>
            <p className="text-xs sm:text-sm text-gray-900/60">
              관리자가 매칭을 실행하면 결과를 확인할 수 있습니다.
            </p>
          </div>
        )}

        {/* Match Result */}
        {user && match && (
          <div className="bg-primary p-6 sm:p-8 rounded-[30px] shadow-lg border-4 border-gray-900 text-center mb-6 sm:mb-8">
            <div className="text-5xl sm:text-6xl mb-4">🎁</div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
              매칭 완료!
            </h2>
            <div className="bg-white p-4 sm:p-6 rounded-[30px] shadow-md mb-4">
              <p className="text-base sm:text-lg text-gray-900 mb-2">당신의 Manito는</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 break-words">
                {match.profiles_receiver.nickname}
              </p>
              <p className="text-base sm:text-lg text-gray-900">입니다! 🎉</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-900/80">
              비밀을 지켜주세요! 선물을 준비해주세요! 🎄
            </p>
          </div>
        )}

        {/* Participants List - Only show if logged in */}
        {user && (
          <div className="bg-primary p-4 sm:p-6 rounded-[30px] shadow-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">
              참가자 목록 ({participants.length}명)
            </h2>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-white rounded-[30px]"
                >
                  <span className="font-medium text-sm sm:text-base text-gray-900">
                    {participant.profiles.nickname}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-900/60">
                    {new Date(participant.joined_at).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ))}
              {participants.length === 0 && (
                <p className="text-center text-gray-900/60 py-4 text-sm sm:text-base">
                  아직 참가자가 없습니다.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
