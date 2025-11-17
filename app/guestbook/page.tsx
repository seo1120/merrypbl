'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

type Message = {
  id: number
  content: string
  created_at: string
  user_id: string
  profiles: {
    nickname: string
  }
}

type Ornament = {
  messageId: number
  type: 'cookie' | 'heart' | 'candycane' | 'light'
  x: number // 트리 viewBox 기준 x 좌표 (0-413)
  y: number // 트리 viewBox 기준 y 좌표 (0-642)
}

type Snowflake = {
  id: number
  left: number
  size: number
  duration: number
  delay: number
  drift: number
}

export default function GuestbookPage() {
  const { user, loading } = useAuth()
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const [nickname, setNickname] = useState('')
  const [needsNickname, setNeedsNickname] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showMessagePopup, setShowMessagePopup] = useState(false)
  const [ornaments, setOrnaments] = useState<Ornament[]>([])

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
      setShowNicknameModal(true)
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
    setShowNicknameModal(false)
    setSubmitting(false)
  }

  // Seeded random number generator for consistent randomness
  const seededRandom = (seed: number): number => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  // Get tree boundaries at a specific y coordinate with padding
  // 각 y 좌표에서 해당하는 모든 삼각형을 확인하고 가장 넓은 x 범위를 반환
  const getTreeBounds = (y: number, padding: number = 20): { minX: number; maxX: number; minY: number; maxY: number } | null => {
    // 트리 기둥 제외 (y=447.318~631, x=170.296~241.364)
    if (y >= 447.318 && y <= 631) {
      return null // 기둥 영역
    }
    
    // 각 삼각형의 x 범위 계산 (겹치는 부분은 합집합)
    let minX = Infinity
    let maxX = -Infinity
    let validY = false
    
    // 첫 번째 삼각형: y=80.0604~255.233
    // 위쪽: x=197.851 (중앙), 아래쪽: x=113.547~299.453
    if (y >= 80.0604 + padding && y <= 255.233 - padding) {
      const ratio = (y - 80.0604) / (255.233 - 80.0604)
      const centerX = 197.851
      const bottomLeft = 113.547
      const bottomRight = 299.453
      // 삼각형이므로 위에서 아래로 넓어짐
      const leftX = centerX - (centerX - bottomLeft) * ratio
      const rightX = centerX + (bottomRight - centerX) * ratio
      minX = Math.min(minX, leftX + padding)
      maxX = Math.max(maxX, rightX - padding)
      validY = true
    }
    
    // 두 번째 삼각형: y=136.477~372.898
    // 위쪽: x=197.84 (중앙), 아래쪽: x=78.6628~334.337
    if (y >= 136.477 + padding && y <= 372.898 - padding) {
      const ratio = (y - 136.477) / (372.898 - 136.477)
      const centerX = 197.84
      const bottomLeft = 78.6628
      const bottomRight = 334.337
      const leftX = centerX - (centerX - bottomLeft) * ratio
      const rightX = centerX + (bottomRight - centerX) * ratio
      minX = Math.min(minX, leftX + padding)
      maxX = Math.max(maxX, rightX - padding)
      validY = true
    }
    
    // 세 번째 삼각형: y=207.545~502.295
    // 위쪽: x=197.84 (중앙), 아래쪽: x=44.9862~368.014
    if (y >= 207.545 + padding && y <= 502.295 - padding) {
      const ratio = (y - 207.545) / (502.295 - 207.545)
      const centerX = 197.84
      const bottomLeft = 44.9862
      const bottomRight = 368.014
      const leftX = centerX - (centerX - bottomLeft) * ratio
      const rightX = centerX + (bottomRight - centerX) * ratio
      minX = Math.min(minX, leftX + padding)
      maxX = Math.max(maxX, rightX - padding)
      validY = true
    }
    
    if (!validY || minX >= maxX) {
      return null
    }
    
    return { 
      minX, 
      maxX, 
      minY: 80.0604 + padding, 
      maxY: 502.295 - padding 
    }
  }

  // Check if point is inside the green tree area with padding
  const isInsideTree = (x: number, y: number, padding: number = 20): boolean => {
    const bounds = getTreeBounds(y, padding)
    if (!bounds) return false
    return x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY
  }

  // Generate consistent ornament for a message based on its ID
  // 메시지 ID만으로 결정적인 위치를 생성하여 항상 같은 위치에 배치
  // 하지만 다른 오너먼트와 겹치지 않도록 조정
  const generateOrnament = (messageId: number, existingOrnaments: Ornament[] = []): Ornament => {
    const types: ('cookie' | 'heart' | 'candycane' | 'light')[] = ['cookie', 'heart', 'candycane', 'light']
    // Use message ID as seed for consistent randomness
    const seed = messageId
    const type = types[seed % types.length]
    
    const padding = 40 // 트리 경계에서 안쪽으로 들어갈 패딩 (픽셀) - 더 엄격하게
    const minDistance = 60 // 오너먼트 간 최소 거리 (픽셀)
    
    // 메시지 ID를 기반으로 항상 같은 기본 위치 생성
    const random1 = seededRandom(seed * 7919 + 49297)
    const random2 = seededRandom(seed * 7919 + 49297 + 1)
    
    // 트리 영역 내에서 랜덤 위치 생성 (패딩 적용)
    // y 범위: 80+padding ~ 502-padding (트리 끝까지, 기둥 제외)
    const minY = 80 + padding
    const maxY = 502 - padding
    let baseY = minY + random2 * (maxY - minY)
    
    // 기둥 영역 제외 (y=447~631)
    if (baseY >= 447 && baseY <= 631) {
      // 기둥 영역이면 위쪽으로 이동
      baseY = 400 + random2 * (447 - 400 - padding)
    }
    
    // 해당 y 좌표에서 트리의 x 범위 계산 (패딩 적용)
    const bounds = getTreeBounds(baseY, padding)
    
    if (!bounds) {
      // 기본 위치로 폴백
      const centerX = 197.84
      return { messageId, type, x: centerX, y: 250 }
    }
    
    // 패딩이 적용된 범위 내에서 랜덤 x 위치 생성
    let baseX = bounds.minX + random1 * (bounds.maxX - bounds.minX)
    
    // 최종 위치 (겹치지 않도록 조정)
    let x = baseX
    let y = baseY
    
    // 기존 오너먼트와의 거리 체크 및 조정
    let attempts = 0
    const maxAttempts = 50
    let found = false
    
    while (!found && attempts < maxAttempts) {
      // 시도마다 약간씩 다른 위치 시도
      const offsetX = (attempts % 10) * 10 - 45 // -45 ~ 45
      const offsetY = Math.floor(attempts / 10) * 10 - 25 // -25 ~ 25
      
      x = baseX + offsetX
      y = baseY + offsetY
      
      // 트리 내부인지 확인
      if (!isInsideTree(x, y, padding)) {
        attempts++
        continue
      }
      
      // 기존 오너먼트와의 거리 확인
      const tooClose = existingOrnaments.some(orn => {
        const dx = orn.x - x
        const dy = orn.y - y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance < minDistance
      })
      
      if (!tooClose) {
        found = true
      }
      
      attempts++
    }
    
    // 최대 시도 후에도 못 찾으면 트리 내부의 안전한 위치 찾기
    if (!found) {
      // 트리 중앙 근처에서 안전한 위치 찾기
      const centerX = 197.84
      let safeAttempts = 0
      const maxSafeAttempts = 100
      
      while (safeAttempts < maxSafeAttempts) {
        const safeRandom1 = seededRandom(seed * 2 + safeAttempts)
        const safeRandom2 = seededRandom(seed * 2 + safeAttempts + 1)
        
        x = centerX + (safeRandom1 - 0.5) * 150
        y = 150 + safeRandom2 * 250
        
        if (isInsideTree(x, y, padding)) {
          // 다른 오너먼트와의 거리도 체크
          const tooClose = existingOrnaments.some(orn => {
            const dx = orn.x - x
            const dy = orn.y - y
            const distance = Math.sqrt(dx * dx + dy * dy)
            return distance < minDistance
          })
          
          if (!tooClose) {
            found = true
            break
          }
        }
        
        safeAttempts++
      }
      
      // 여전히 못 찾으면 기본 위치 (트리 내부 확인 필수)
      if (!found) {
        x = centerX
        y = 250
        // 트리 밖이면 강제로 트리 내부로 이동
        if (!isInsideTree(x, y, padding)) {
          const bounds = getTreeBounds(250, padding)
          if (bounds) {
            x = (bounds.minX + bounds.maxX) / 2
          }
        }
      }
    }
    
    // 최종 검증: 트리 내부인지 확인
    if (!isInsideTree(x, y, padding)) {
      // 트리 밖이면 트리 중앙으로 강제 이동
      const centerX = 197.84
      const bounds = getTreeBounds(250, padding)
      if (bounds) {
        x = (bounds.minX + bounds.maxX) / 2
        y = 250
      } else {
        x = centerX
        y = 250
      }
    }
    
    return { messageId, type, x, y }
  }

  // Generate all ornaments with collision avoidance
  // 이미 생성된 오너먼트들도 겹치지 않도록 재배치
  const generateAllOrnaments = (messages: Message[]): Ornament[] => {
    const ornaments: Ornament[] = []
    const minDistance = 60 // 오너먼트 간 최소 거리
    
    // Sort by ID to ensure consistent generation order
    const sortedMessages = [...messages].sort((a, b) => a.id - b.id)
    
    // 첫 번째 패스: 기본 위치 생성
    for (const message of sortedMessages) {
      const ornament = generateOrnament(message.id, ornaments)
      ornaments.push(ornament)
    }
    
    // 두 번째 패스: 겹치는 오너먼트들을 분리
    for (let i = 0; i < ornaments.length; i++) {
      for (let j = i + 1; j < ornaments.length; j++) {
        const orn1 = ornaments[i]
        const orn2 = ornaments[j]
        
        const dx = orn2.x - orn1.x
        const dy = orn2.y - orn1.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < minDistance) {
          // 겹치는 경우, 두 오너먼트를 서로 멀리 이동
          const angle = Math.atan2(dy, dx)
          const moveDistance = (minDistance - distance) / 2 + 5
          
          // orn1을 반대 방향으로 이동
          const newX1 = orn1.x - Math.cos(angle) * moveDistance
          const newY1 = orn1.y - Math.sin(angle) * moveDistance
          
          // orn2를 원래 방향으로 이동
          const newX2 = orn2.x + Math.cos(angle) * moveDistance
          const newY2 = orn2.y + Math.sin(angle) * moveDistance
          
          // 트리 내부인지 확인하고 적용
          const padding = 40
          if (isInsideTree(newX1, newY1, padding)) {
            ornaments[i] = { ...orn1, x: newX1, y: newY1 }
          } else {
            // 트리 밖이면 원래 위치 유지하되, 트리 내부로 조정
            const bounds = getTreeBounds(orn1.y, padding)
            if (bounds) {
              const adjustedX = Math.max(bounds.minX, Math.min(bounds.maxX, orn1.x))
              ornaments[i] = { ...orn1, x: adjustedX }
            }
          }
          if (isInsideTree(newX2, newY2, padding)) {
            ornaments[j] = { ...orn2, x: newX2, y: newY2 }
          } else {
            // 트리 밖이면 원래 위치 유지하되, 트리 내부로 조정
            const bounds = getTreeBounds(orn2.y, padding)
            if (bounds) {
              const adjustedX = Math.max(bounds.minX, Math.min(bounds.maxX, orn2.x))
              ornaments[j] = { ...orn2, x: adjustedX }
            }
          }
        }
      }
    }
    
    // 세 번째 패스: 트리 밖에 있는 오너먼트들을 트리 내부로 이동
    const padding = 40
    for (let i = 0; i < ornaments.length; i++) {
      const orn = ornaments[i]
      if (!isInsideTree(orn.x, orn.y, padding)) {
        // 트리 밖이면 해당 y 좌표의 트리 내부로 x 좌표 조정
        const bounds = getTreeBounds(orn.y, padding)
        if (bounds) {
          const centerX = (bounds.minX + bounds.maxX) / 2
          ornaments[i] = { ...orn, x: centerX }
        } else {
          // y 좌표도 트리 밖이면 트리 중앙으로 이동
          const centerX = 197.84
          const safeY = 250
          const safeBounds = getTreeBounds(safeY, padding)
          if (safeBounds) {
            ornaments[i] = { ...orn, x: (safeBounds.minX + safeBounds.maxX) / 2, y: safeY }
          } else {
            ornaments[i] = { ...orn, x: centerX, y: safeY }
          }
        }
      }
    }
    
    return ornaments
  }

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        user_id,
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
        user_id: msg.user_id,
        profiles: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles,
      }))
      setMessages(transformedData)
      // Generate ornaments with spacing
      const generatedOrnaments = generateAllOrnaments(transformedData)
      setOrnaments(generatedOrnaments)
    }
  }

  const handleDeleteMessage = async (messageId: number) => {
    if (!user) return
    if (!confirm('이 메시지를 삭제하시겠습니까?')) return

    setSubmitting(true)
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', user.id) // 본인 메시지만 삭제 가능

    if (error) {
      alert('메시지 삭제에 실패했습니다: ' + error.message)
      setSubmitting(false)
      return
    }

    fetchMessages()
    setSubmitting(false)
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
    setShowMessageModal(false)
    fetchMessages()
    setSubmitting(false)
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

  if (loading) {
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
          <button
            onClick={() => {
              if (!user) {
                handleLogin()
              } else {
                setShowMessageModal(true)
              }
            }}
            className="bg-primary text-gray-900 px-6 py-2 rounded-[30px] font-['puntino'] text-[18px] sm:text-[20px] touch-manipulation whitespace-nowrap flex-shrink-0"
          >
            add ornament
          </button>
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
          Merry<br />
          Christmas<br />
          PBL
        </h1>
      </div>

      {/* Christmas Tree with Ornaments */}
      <div className="relative z-10 flex justify-center mb-8">
        <div className="relative inline-block max-w-[80%] sm:max-w-[413px]">
          <Image
            src="/svg/christmastree.svg"
            alt="Christmas Tree"
            width={413}
            height={642}
            className="w-full h-auto"
          />
          {/* Ornaments positioned absolutely over the tree */}
          {ornaments.map((ornament) => {
            const message = messages.find(m => m.id === ornament.messageId)
            if (!message) return null
            
            // Calculate percentage position for responsive layout
            const xPercent = (ornament.x / 413) * 100
            const yPercent = (ornament.y / 642) * 100
            
            const ornamentPaths = {
              cookie: '/svg/cookie.svg',
              heart: '/svg/heart.svg',
              candycane: '/svg/candycane.svg',
              light: '/svg/light.svg',
            }
            
            return (
              <button
                key={ornament.messageId}
                onClick={() => {
                  setSelectedMessage(message)
                  setShowMessagePopup(true)
                }}
                className="absolute cursor-pointer hover:scale-110 transition-transform touch-manipulation z-20"
                style={{
                  left: `${xPercent}%`,
                  top: `${yPercent}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '40px',
                  height: '40px',
                }}
              >
                <Image
                  src={ornamentPaths[ornament.type]}
                  alt={ornament.type}
                  width={40}
                  height={40}
                  className="w-full h-full"
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* Messages List */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-8">
        <div className="space-y-3 sm:space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-white/20"
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <span className="font-semibold text-white text-sm sm:text-base">
                  {message.profiles.nickname}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-white/70 whitespace-nowrap">
                    {new Date(message.created_at).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {user && message.user_id === user.id && (
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      disabled={submitting}
                      className="text-white/70 hover:text-white text-lg leading-none touch-manipulation disabled:opacity-50"
                      title="삭제"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <p className="text-white text-sm sm:text-base break-words">{message.content}</p>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-center text-white/70 py-8 text-sm sm:text-base">
              아직 메시지가 없습니다. 첫 번째 메시지를 남겨보세요!
            </p>
          )}
          </div>
        </div>

      {/* Message Add Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary w-[300px] h-[300px] rounded-[30px] p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-900 font-semibold text-lg">메시지 추가</h2>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-900 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitMessage} className="flex-1 flex flex-col">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="크리스마스 메시지를 남겨주세요..."
                className="flex-1 w-full px-4 py-3 text-base border border-gray-300 rounded mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                rows={6}
                maxLength={200}
              />
              <button
                type="submit"
                disabled={submitting || !newMessage.trim()}
                className="w-full bg-gray-900 text-white px-4 py-3 rounded hover:bg-gray-800 active:bg-gray-700 disabled:bg-gray-400 text-base font-semibold touch-manipulation min-h-[44px]"
              >
                {submitting ? '전송 중...' : '메시지 남기기'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Message Popup (when clicking ornament) */}
      {showMessagePopup && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-primary w-[300px] h-[300px] rounded-[30px] p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-900 font-semibold text-lg">
                {selectedMessage.profiles.nickname}
              </h2>
              <button
                onClick={() => {
                  setShowMessagePopup(false)
                  setSelectedMessage(null)
                }}
                className="text-gray-900 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mb-4">
              <p className="text-gray-900 text-sm sm:text-base break-words whitespace-pre-wrap">
                {selectedMessage.content}
              </p>
        </div>
            <div className="text-xs text-gray-700">
              {new Date(selectedMessage.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
            </div>
                </div>
              </div>
      )}

      {/* Nickname Modal */}
      {showNicknameModal && needsNickname && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg max-w-md w-full">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">닉네임 설정</h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              첫 로그인입니다. 사용할 닉네임을 입력해주세요.
            </p>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full px-4 py-3 text-base border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              maxLength={20}
              autoFocus
            />
            <div className="flex gap-4">
              <button
                onClick={handleSetNickname}
                disabled={submitting || !nickname.trim()}
                className="flex-1 bg-primary text-gray-900 px-4 py-3 rounded hover:opacity-90 active:opacity-80 disabled:opacity-50 text-base font-semibold touch-manipulation min-h-[44px]"
              >
                {submitting ? '설정 중...' : '설정하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
