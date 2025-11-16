# Merry PBL - 크리스마스 이벤트 웹사이트

친구들을 위한 크리스마스 이벤트 웹사이트입니다.

## 기능

1. **크리스마스 트리 방명록**: 메시지를 남기고 트리에 장식하세요
2. **Secret Santa (Manito) 게임**: 비밀 선물 교환 게임

## 기술 스택

- Frontend: Next.js 14, Tailwind CSS
- Backend: Supabase (Auth, Database, Edge Functions)

## 설정 방법

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env.local` 파일을 생성하고 다음을 추가하세요:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Supabase 설정:
- `supabase/schema.sql` 파일의 SQL을 Supabase SQL Editor에서 실행하세요
- `supabase/functions/run-manito-matching/index.ts` 파일을 Supabase Edge Function으로 배포하세요

4. 개발 서버 실행:
```bash
npm run dev
```

