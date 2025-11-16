# Vercel 배포 가이드

## 배포 전 체크리스트

### 1. GitHub에 코드 푸시
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Vercel에서 프로젝트 연결
1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. "Add New..." → "Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동 감지됨)
   - **Output Directory**: `.next` (자동 감지됨)

### 3. 환경 변수 설정 (중요!)

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

**Settings → Environment Variables**에서 추가:

1. `NEXT_PUBLIC_SUPABASE_URL`
   - 값: `https://your-project-id.supabase.co`
   - 예: `https://vluostnmopwfsqqhkxji.supabase.co`

2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - 값: Supabase Dashboard → Settings → API → `anon` `public` 키
   - 예: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**환경 변수 적용 범위:**
- Production ✅
- Preview ✅
- Development ✅

### 4. Supabase 설정 확인

#### 4.1 데이터베이스 스키마 설정
1. Supabase Dashboard → SQL Editor로 이동
2. `supabase/schema.sql` 파일의 내용을 복사하여 실행
3. 모든 테이블과 RLS 정책이 생성되었는지 확인

#### 4.2 Google OAuth 설정
1. Supabase Dashboard → Authentication → Providers
2. Google 제공자 활성화
3. **Redirect URL**에 Vercel 배포 URL 추가:
   ```
   https://your-project.vercel.app/auth/callback
   ```
   - Google Cloud Console에서도 동일한 URL을 승인된 리디렉션 URI로 추가해야 합니다.

#### 4.3 Edge Function 배포
1. Supabase Dashboard → Edge Functions
2. `run-manito-matching` 함수 생성
3. `supabase/functions/run-manito-matching/index.ts` 코드 복사
4. 환경 변수 설정:
   - `SUPABASE_URL`: 자동 설정됨
   - `SUPABASE_SERVICE_ROLE_KEY`: Settings → API → `service_role` 키

### 5. 배포 후 확인 사항

1. ✅ 홈페이지가 정상적으로 로드되는지 확인
2. ✅ Google 로그인이 작동하는지 확인
3. ✅ 방명록 페이지에서 메시지 조회/작성이 가능한지 확인
4. ✅ Secret Santa 페이지 접근 시 로그인 유도 메시지가 표시되는지 확인
5. ✅ 로그인 후 Secret Santa 참가 기능이 작동하는지 확인

## 문제 해결

### 환경 변수가 적용되지 않는 경우
- Vercel 대시보드에서 환경 변수 설정 후 **재배포** 필요
- 환경 변수 이름에 오타가 없는지 확인 (`NEXT_PUBLIC_` 접두사 필수)

### Google OAuth 오류
- Google Cloud Console에서 승인된 리디렉션 URI 확인
- Supabase에서 Redirect URL 설정 확인
- Vercel 배포 URL과 일치하는지 확인

### 데이터베이스 연결 오류
- Supabase 프로젝트가 활성 상태인지 확인
- RLS 정책이 올바르게 설정되었는지 확인
- Supabase Dashboard → API → Project URL과 Anon Key 확인

## 추가 리소스

- [Vercel 문서](https://vercel.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)

