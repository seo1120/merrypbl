'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Snowflake = {
  id: number
  left: number
  size: number
  duration: number
  delay: number
  drift: number
}

type Countdown = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function Home() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

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

  // Christmas countdown - 2025년 12월 25일 00:00:00 (어바인 시간 기준, Pacific Time)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      // 2025년 12월 25일 00:00:00 Pacific Time (어바인 시간)
      // Pacific Time은 UTC-8 (PST) 또는 UTC-7 (PDT)이지만, 12월은 PST (UTC-8)입니다
      const christmas = new Date('2025-12-25T00:00:00-08:00')

      const diff = christmas.getTime() - now.getTime()

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        setCountdown({ days, hours, minutes, seconds })
      } else {
        // 크리스마스가 지났으면 0으로 표시
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    // 즉시 한 번 실행
    updateCountdown()
    // 1초마다 업데이트
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

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
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 text-center mt-8 mb-8">
        <h1 className="font-['puntino'] text-[42px] sm:text-[56px] text-white leading-tight mb-4">
          Merry<br />
          Christmas<br />
          PBL
        </h1>
        <p className="text-white/80 text-base sm:text-lg mt-6 mb-8">
          G-PBL 팀을 위한 크리스마스 이벤트 웹사이트
        </p>

        {/* Christmas Countdown */}
        <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-4 sm:p-6 mx-4 sm:mx-auto max-w-md border border-white/20">
          <p className="text-white/90 text-sm sm:text-base mb-4">until christmas !</p>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-3 sm:p-4 mb-2">
                <div className="text-2xl sm:text-3xl font-bold text-white font-['puntino']">
                  {countdown.days.toString().padStart(2, '0')}
                </div>
              </div>
              <p className="text-white/70 text-xs sm:text-sm">일</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-3 sm:p-4 mb-2">
                <div className="text-2xl sm:text-3xl font-bold text-white font-['puntino']">
                  {countdown.hours.toString().padStart(2, '0')}
                </div>
              </div>
              <p className="text-white/70 text-xs sm:text-sm">시간</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-3 sm:p-4 mb-2">
                <div className="text-2xl sm:text-3xl font-bold text-white font-['puntino']">
                  {countdown.minutes.toString().padStart(2, '0')}
                </div>
              </div>
              <p className="text-white/70 text-xs sm:text-sm">분</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-3 sm:p-4 mb-2">
                <div className="text-2xl sm:text-3xl font-bold text-white font-['puntino']">
                  {countdown.seconds.toString().padStart(2, '0')}
                </div>
              </div>
              <p className="text-white/70 text-xs sm:text-sm">초</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-8">
        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          <Link
            href="/guestbook"
            className="bg-primary p-6 sm:p-8 rounded-[30px] shadow-lg active:shadow-xl transition-shadow touch-manipulation block"
          >
            <div className="text-4xl mb-4">🎁</div>
            <h2 className="text-xl sm:text-2xl font-['puntino'] text-gray-900 mb-2">
              Guestbook
            </h2>
            <p className="text-gray-900/80 text-sm sm:text-base">
              메시지를 남기고 크리스마스 트리를 장식해보세요!
            </p>
          </Link>
          <Link
            href="/manito"
            className="bg-primary p-6 sm:p-8 rounded-[30px] shadow-lg active:shadow-xl transition-shadow touch-manipulation block"
          >
            <div className="text-4xl mb-4">🎅</div>
            <h2 className="text-xl sm:text-2xl font-['puntino'] text-gray-900 mb-2">
              Secret Santa
            </h2>
            <p className="text-gray-900/80 text-sm sm:text-base">
              비밀 선물 교환 게임에 참여하세요!
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
