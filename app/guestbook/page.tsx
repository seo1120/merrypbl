'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../components/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Message = {
  id: number
  content: string
  created_at: string
  profiles: {
    nickname: string
  }
}

export default function GuestbookPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [nickname, setNickname] = useState('')
  const [needsNickname, setNeedsNickname] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Always fetch messages (even without login)
    fetchMessages()

    // Check nickname only if user is logged in
    if (user) {
      checkAndSetNickname()
    }
  }, [user, loading])

  const checkAndSetNickname = async () => {
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', user.id)
      .single()

    if (!profile) {
      setNeedsNickname(true)
      setShowModal(true)
    }
  }

  const handleSetNickname = async () => {
    if (!user || !nickname.trim()) return

    setSubmitting(true)
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        nickname: nickname.trim(),
      })

    if (error) {
      if (error.code === '23505') {
        alert('이미 사용 중인 닉네임입니다.')
      } else {
        alert('닉네임 설정에 실패했습니다: ' + error.message)
      }
      setSubmitting(false)
      return
    }

    setNeedsNickname(false)
    setShowModal(false)
    setSubmitting(false)
  }

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        profiles:user_id (
          nickname
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching messages:', error)
    } else if (data) {
      // Transform the data to match the Message type
      const transformedData: Message[] = data.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        profiles: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles,
      }))
      setMessages(transformedData)
    }
  }

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newMessage.trim()) return

    setSubmitting(true)
    const { error } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        content: newMessage.trim(),
      })

    if (error) {
      alert('메시지 전송에 실패했습니다: ' + error.message)
      setSubmitting(false)
      return
    }

    setNewMessage('')
    fetchMessages()
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navbar />
      <main className="container mx-auto px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-center text-green-800 mb-4 sm:mb-8">
          🎄 크리스마스 트리 방명록 🎄
        </h1>

        {/* Nickname Modal */}
        {showModal && needsNickname && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-lg max-w-md w-full">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">닉네임 설정</h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                첫 로그인입니다. 사용할 닉네임을 입력해주세요.
              </p>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                maxLength={20}
                autoFocus
              />
              <div className="flex gap-4">
                <button
                  onClick={handleSetNickname}
                  disabled={submitting || !nickname.trim()}
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 active:bg-green-800 disabled:bg-gray-400 text-base font-semibold touch-manipulation min-h-[44px]"
                >
                  {submitting ? '설정 중...' : '설정하기'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Christmas Tree Image */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="relative">
            <div className="w-48 h-72 sm:w-64 sm:h-96 bg-green-600 rounded-lg flex items-center justify-center text-5xl sm:text-6xl">
              🎄
            </div>
            {/* Messages displayed as ornaments */}
            <div className="absolute inset-0 pointer-events-none">
              {messages.slice(0, 10).map((message, index) => {
                const angle = (index * 36 - 90) * (Math.PI / 180)
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
                const radius = isMobile ? 75 : 100
                const centerX = isMobile ? 96 : 128
                const centerY = isMobile ? 144 : 192
                const x = centerX + radius * Math.cos(angle)
                const y = centerY + radius * Math.sin(angle)
                return (
                  <div
                    key={message.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${x}px`, top: `${y}px` }}
                  >
                    <div className="bg-yellow-300 text-[10px] sm:text-xs p-1 rounded shadow-lg max-w-[60px] sm:max-w-[80px] truncate">
                      {message.profiles.nickname}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Message Form - Only show if logged in */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
          {user ? (
            <form onSubmit={handleSubmitMessage} className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="크리스마스 메시지를 남겨주세요..."
                className="w-full px-4 py-3 text-base border border-gray-300 rounded mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={4}
                maxLength={200}
              />
              <button
                type="submit"
                disabled={submitting || !newMessage.trim()}
                className="w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 active:bg-green-800 disabled:bg-gray-400 text-base font-semibold touch-manipulation min-h-[44px]"
              >
                {submitting ? '전송 중...' : '메시지 남기기'}
              </button>
            </form>
          ) : (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center">
              <p className="text-gray-700 mb-4 text-sm sm:text-base">메시지를 남기려면 로그인이 필요합니다.</p>
              <button
                onClick={async () => {
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                    },
                  })
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 active:bg-blue-800 text-base font-semibold touch-manipulation min-h-[44px]"
              >
                Google로 로그인하기
              </button>
            </div>
          )}
        </div>

        {/* Messages List */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-green-800">방명록 메시지</h2>
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="bg-white p-3 sm:p-4 rounded-lg shadow-md border-l-4 border-green-500"
              >
                <div className="flex justify-between items-start mb-2 gap-2">
                  <span className="font-bold text-green-700 text-sm sm:text-base">
                    {message.profiles.nickname}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                    {new Date(message.created_at).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-gray-700 text-sm sm:text-base break-words">{message.content}</p>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-center text-gray-500 py-8 text-sm sm:text-base">
                아직 메시지가 없습니다. 첫 번째 메시지를 남겨보세요!
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

