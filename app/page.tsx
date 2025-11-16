import { Navbar } from './components/Navbar'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-green-800 mb-4">
            🎄 Merry PBL 🎄
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-8 sm:mb-12">
            G-PBL 팀을 위한 크리스마스 이벤트 웹사이트
          </p>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-8 max-w-2xl mx-auto">
            <Link
              href="/guestbook"
              className="bg-white p-6 sm:p-8 rounded-lg shadow-lg active:shadow-xl transition-shadow border-2 border-green-200 touch-manipulation block"
            >
              <div className="text-4xl mb-4">🎁</div>
              <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-2">
                크리스마스 트리 방명록
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                메시지를 남기고 크리스마스 트리를 장식해보세요!
              </p>
            </Link>
            <Link
              href="/manito"
              className="bg-white p-6 sm:p-8 rounded-lg shadow-lg active:shadow-xl transition-shadow border-2 border-red-200 touch-manipulation block"
            >
              <div className="text-4xl mb-4">🎅</div>
              <h2 className="text-xl sm:text-2xl font-bold text-red-800 mb-2">
                Secret Santa
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                비밀 선물 교환 게임에 참여하세요!
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

