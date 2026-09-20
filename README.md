# 한입지도 (Kakao Food Map)

카카오맵과 카카오 로컬 API를 사용해 주변 또는 원하는 지역의 맛집을 찾는 Next.js 웹앱입니다. 별도 회원이나 데이터베이스 없이 즐겨찾기, 최근 검색어, 최근 본 맛집을 브라우저에 저장합니다.

## 포함 기능

- 지역/상호/메뉴 키워드 검색과 내 주변·이 지역 재검색
- 음식 종류와 500m·1km·3km·5km 반경 필터
- 카카오맵 마커, 클러스터, 선택 오버레이, 카드 ↔ 지도 연동
- GPS 현재 위치와 정확도 원 표시
- 전화, 카카오맵 상세, 현재 위치 기준 도보 예상 시간 및 길찾기 링크
- 즐겨찾기·최근 검색·최근 본 맛집 LocalStorage 저장
- 모바일 하단 메뉴, SEO, robots/sitemap, 기본 보안 헤더와 오류 화면

## 시작하기

Node.js 20.9 이상에서 실행하세요.

```bash
npm install
copy .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 카카오 API 키 설정

`.env.local`에 키를 입력합니다.

```env
NEXT_PUBLIC_KAKAO_MAP_KEY=카카오_JavaScript_KEY
KAKAO_REST_API_KEY=카카오_REST_API_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

1. Kakao Developers에서 앱을 만들고 JavaScript 키와 REST API 키를 발급합니다.
2. 플랫폼 설정의 Web 도메인에 `http://localhost:3000`을 등록합니다.
3. 배포 후에는 실제 Vercel 도메인도 Web 도메인에 추가합니다.

`KAKAO_REST_API_KEY`는 서버 Route Handler에서만 쓰이며, `NEXT_PUBLIC_` 접두사를 붙이면 안 됩니다. 키가 비어 있으면 UI 흐름을 점검할 수 있는 미리보기 장소만 보입니다.

## 주요 구조

```text
app/api/kakao/search/route.js  # REST 키를 숨긴 장소 검색 프록시
app/api/kakao/route/route.js   # 도보 예상치 + 카카오맵 길찾기 링크
components/RestaurantExplorer  # 검색·선택·저장 상태 통합
components/KakaoMap            # 지도 SDK, 마커, 클러스터, 오버레이
hooks/                          # GPS와 LocalStorage 개인화
```

## 검증 및 배포

```bash
npm run build
npm run start
```

GitHub에 올린 뒤 Vercel에서 저장소를 Import하고 동일한 환경 변수를 등록하세요. 길찾기의 내부 예상 시간은 직선거리 기반의 간단한 도보 추정치이며, 정확한 실시간 경로·대중교통 정보는 연결된 카카오맵에서 확인합니다.
