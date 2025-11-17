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

export default function Home() {
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
      <div className="relative z-10 text-center mt-8 mb-12">
        <h1 className="font-['puntino'] text-[42px] sm:text-[56px] text-white leading-tight mb-4">
          Merry<br />
          Christmas<br />
          PBL
        </h1>
        <p className="text-white/80 text-base sm:text-lg mt-6">
          G-PBL 팀을 위한 크리스마스 이벤트 웹사이트
        </p>
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
