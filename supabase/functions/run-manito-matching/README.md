# run-manito-matching Edge Function

Secret Santa 게임의 매칭을 실행하는 Supabase Edge Function입니다.

## 배포 방법

1. Supabase CLI를 사용하여 배포:
```bash
supabase functions deploy run-manito-matching
```

2. 또는 Supabase Dashboard에서:
   - Functions 섹션으로 이동
   - "Create a new function" 클릭
   - 함수 이름: `run-manito-matching`
   - 코드를 복사하여 붙여넣기

## 실행 방법

1. Supabase Dashboard에서:
   - Functions > run-manito-matching > Invoke

2. 또는 HTTP 요청으로:
```bash
curl -X POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/run-manito-matching' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

## 주의사항

- 이 함수는 Service Role Key를 사용하므로 RLS를 우회합니다
- 한 번 실행되면 이미 매칭이 존재하는 경우 에러를 반환합니다
- 최소 2명 이상의 참가자가 필요합니다

