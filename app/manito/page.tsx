'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../components/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

export default function ManitoPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [match, setMatch] = useState<Match | null>(null)
  const [isParticipant, setIsParticipant] = useState(false)
  const [joining, setJoining] = useState(false)
  const [fetching, setFetching] = useState(true)

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

  if (loading || (fetching && user)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <Navbar />
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-center text-red-800 mb-6 sm:mb-8">
          🎅 Secret Santa (Manito) 🎅
        </h1>

        <div className="max-w-2xl mx-auto">
          {/* Login Required Message */}
          {!user && (
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center mb-6 sm:mb-8">
              <div className="text-5xl sm:text-6xl mb-4">🔒</div>
              <h2 className="text-xl sm:text-2xl font-bold text-red-800 mb-4">
                로그인이 필요합니다
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Secret Santa 게임에 참여하려면 로그인해주세요.
              </p>
              <button
                onClick={async () => {
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                    },
                  })
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 text-base font-semibold touch-manipulation min-h-[44px] w-full sm:w-auto"
              >
                Google로 로그인하기
              </button>
            </div>
          )}

          {/* Join Button */}
          {user && !isParticipant && (
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center mb-6 sm:mb-8">
              <p className="text-base sm:text-lg text-gray-700 mb-6">
                Secret Santa 게임에 참가하시겠습니까?
              </p>
              <button
                onClick={handleJoin}
                disabled={joining}
                className="bg-red-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-red-700 active:bg-red-800 disabled:bg-gray-400 text-base sm:text-lg font-semibold touch-manipulation min-h-[44px] w-full sm:w-auto"
              >
                {joining ? '참가 중...' : 'Secret Santa 참가하기'}
              </button>
            </div>
          )}

          {/* Waiting Message */}
          {user && isParticipant && !match && (
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center mb-6 sm:mb-8">
              <div className="text-5xl sm:text-6xl mb-4">⏳</div>
              <h2 className="text-xl sm:text-2xl font-bold text-red-800 mb-4">
                게임 시작을 기다리는 중...
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                현재 {participants.length}명이 참가했습니다.
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                관리자가 매칭을 실행하면 결과를 확인할 수 있습니다.
              </p>
            </div>
          )}

          {/* Match Result */}
          {user && match && (
            <div className="bg-gradient-to-br from-red-50 to-yellow-50 p-6 sm:p-8 rounded-lg shadow-lg border-4 border-red-300 text-center mb-6 sm:mb-8">
              <div className="text-5xl sm:text-6xl mb-4">🎁</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-red-800 mb-4">
                매칭 완료!
              </h2>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4">
                <p className="text-base sm:text-lg text-gray-700 mb-2">당신의 Manito는</p>
                <p className="text-3xl sm:text-4xl font-bold text-red-600 mb-2 break-words">
                  {match.profiles_receiver.nickname}
                </p>
                <p className="text-base sm:text-lg text-gray-700">입니다! 🎉</p>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                비밀을 지켜주세요! 선물을 준비해주세요! 🎄
              </p>
            </div>
          )}

          {/* Participants List - Only show if logged in */}
          {user && (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <h2 className="text-lg sm:text-xl font-bold mb-4 text-red-800">
                참가자 목록 ({participants.length}명)
              </h2>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <span className="font-medium text-sm sm:text-base">
                      {participant.profiles.nickname}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {new Date(participant.joined_at).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
                {participants.length === 0 && (
                  <p className="text-center text-gray-500 py-4 text-sm sm:text-base">
                    아직 참가자가 없습니다.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

