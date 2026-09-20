# 카카오맵 맛집검색 홈페이지 개발 MASTER SPEC

> Next.js + Kakao Maps / Local API · 1~12단계 통합 개발 문서

**문서 성격:** 지금까지 진행한 1~12단계를 하나로 합친 실행용 개발 명세서입니다. 단계별 소스가 누적 수정된 흐름을 정리하므로, 실제 개발 시에는 12단계의 수정사항을 우선 적용해 최종 통합본으로 구현합니다.

## 0. 프로젝트 최종 범위

| 구분 | 확정 내용 |
|---|---|
| 프레임워크 | Next.js (App Router) |
| 언어 | JavaScript |
| 스타일 | Tailwind CSS |
| 지도 | Kakao Maps JavaScript SDK |
| 장소검색 | Kakao Local REST API |
| 현재위치 | Browser Geolocation API |
| 개인 저장 | LocalStorage |
| 관리자/DB/회원 | 사용하지 않음 |
| 형상관리/배포 | GitHub → Vercel |

### 최종 사용자 흐름

```text
홈 접속 → 현재 위치 또는 지역/맛집 검색 → 지도 마커 + 목록 → 음식종류/반경 필터 → 맛집 선택 → 상세정보 → 전화/카카오맵/길찾기 → 즐겨찾기/최근기록
```

## 1단계. 프로젝트 기획

**목표:** 카카오맵 기반 맛집검색 웹앱의 목적, 화면구성, 사용자 흐름과 개발범위를 확정한다.

### 구현 내용

- 프로젝트 성격: 현재 위치 또는 지역/맛집 검색으로 주변 음식점을 찾는 지도 중심 웹앱
- 핵심 흐름: 접속 → 현재 위치/지역 검색 → 주변 맛집 검색 → 지도 마커/목록 → 상세정보 → 전화/카카오맵/길찾기
- 관리자 페이지, 별도 DB, 회원가입/로그인은 구현하지 않는다.
- 사용자 저장 기능은 브라우저 LocalStorage로 처리한다.
- PC: 좌측 맛집목록 + 우측 지도, 모바일: 검색/필터 → 지도 → 맛집카드 → 하단 네비게이션 구조

### 관련 파일

- `프로젝트 기획서`
- `화면 흐름도`
- `메뉴/기능 정의`

### 핵심 코드/설정

```text
사용자 흐름

홈페이지 접속
  ↓
현재 위치 또는 지역 검색
  ↓
주변 맛집 검색
  ↓
카카오맵 마커 + 맛집 목록
  ↓
맛집 선택
  ↓
상세정보 / 전화 / 지도 / 길찾기
```

### 완료 기준

- [x] 관리자/DB/회원 기능 제외 범위 확정
- [x] 지도 중심 반응형 UI 방향 확정
- [x] 12단계 개발 로드맵의 기반 확정

## 2단계. 기술 스펙 확정

**목표:** 실제 개발에 사용할 Next.js 기반 기술스택과 API 키/환경변수 구조를 고정한다.

### 구현 내용

- 프레임워크: Next.js(App Router), 개발언어: JavaScript
- UI: React + Tailwind CSS
- 지도: Kakao Maps JavaScript SDK
- 맛집검색: Kakao Local REST API
- 현재위치: Browser Geolocation API
- 사용자 저장: LocalStorage
- 형상관리/배포: GitHub → Vercel
- JavaScript Key는 브라우저 지도 표시용, REST API Key는 Next.js 서버 Route Handler에서만 사용한다.

### 관련 파일

- `.env.local`
- `app/`
- `components/`
- `hooks/`
- `lib/`

### 핵심 코드/설정

```text
NEXT_PUBLIC_KAKAO_MAP_KEY=카카오_JavaScript_KEY
KAKAO_REST_API_KEY=카카오_REST_API_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 완료 기준

- [x] Next.js + JavaScript + App Router 확정
- [x] 브라우저 공개키와 서버 비밀키 분리
- [x] GitHub/Vercel 배포 구조 확정

## 3단계. Next.js 기본 프로젝트 구축

**목표:** App Router, Tailwind, 기본 컴포넌트와 반응형 메인 화면의 골격을 만든다.

### 구현 내용

- create-next-app으로 JavaScript/Tailwind/ESLint/App Router 프로젝트 생성
- Header, SearchBar, CategoryFilter, RestaurantList, RestaurantCard, MobileNavigation 기본 컴포넌트 생성
- 실제 카카오맵 연결 전 MapPlaceholder로 지도 영역을 확보
- PC는 2단 레이아웃, 모바일은 지도→목록 순서로 반응형 처리
- .env.local에 키 입력 자리를 만들되 실제 키는 GitHub에 커밋하지 않는다.

### 관련 파일

- `app/layout.js`
- `app/page.js`
- `app/globals.css`
- `components/Header.js`
- `components/SearchBar.js`
- `components/CategoryFilter.js`
- `components/RestaurantList.js`
- `components/RestaurantCard.js`
- `components/MobileNavigation.js`

### 핵심 코드/설정

```text
npx create-next-app@latest kakao-food-map --js --tailwind --eslint --app --use-npm --import-alias "@/*"
cd kakao-food-map
npm run dev
```

### 완료 기준

- [x] localhost:3000 정상 접속
- [x] 검색창/카테고리/맛집 목록/지도 영역 표시
- [x] PC/모바일 기본 반응형 UI 확인

## 4단계. 카카오맵 API 연결

**목표:** 임시 지도 영역을 실제 Kakao Map으로 교체하고 기본 지도 제어 기능을 만든다.

### 구현 내용

- Kakao Developers에서 JavaScript Key 확인 및 http://localhost:3000 도메인 등록
- next/script로 Kakao Maps SDK 동적 로딩
- autoload=false + kakao.maps.load() 방식으로 지도 초기화
- 기본 중심좌표, 지도 레벨, 확대/축소 컨트롤, 지도/스카이뷰 컨트롤 적용
- 지도 이동 후 getCenter()/getLevel()로 현재 중심좌표와 레벨 상태 갱신
- services, clusterer 라이브러리를 함께 로드하여 후속단계 준비

### 관련 파일

- `components/KakaoMap.js`
- `app/page.js`
- `.env.local`

### 핵심 코드/설정

```text
<Script
  id="kakao-map-sdk"
  src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services,clusterer`}
  strategy="afterInteractive"
  onReady={initializeMap}
/>
```

### 완료 기준

- [x] 실제 카카오 지도 표시
- [x] 지도 드래그/확대/축소 작동
- [x] 현재 중심좌표와 지도레벨 상태 반영

## 5단계. 현재 위치(GPS) 연동

**목표:** 사용자의 위치 권한을 받아 현재 위치로 지도를 이동시키고 위치 마커를 표시한다.

### 구현 내용

- navigator.geolocation.getCurrentPosition()을 이용해 위도/경도/정확도 획득
- 위치 권한 거부, 위치정보 불가, 타임아웃 오류를 사용자에게 안내
- 현재 위치 확보 시 KakaoMap으로 좌표 전달 후 map.setCenter() 및 확대
- 현재 위치 마커와 GPS 정확도 범위(Circle) 표시
- PC 검색창과 모바일 하단 메뉴의 내 주변 버튼을 같은 위치 Hook에 연결

### 관련 파일

- `hooks/useGeolocation.js`
- `components/SearchBar.js`
- `components/KakaoMap.js`
- `components/RestaurantExplorer.js`
- `components/MobileNavigation.js`

### 핵심 코드/설정

```text
navigator.geolocation.getCurrentPosition(
  (position) => {
    const location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
  },
  handleError,
  { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
);
```

### 완료 기준

- [x] 내 주변 클릭 시 위치 권한 요청
- [x] 현재 위치로 지도 이동
- [x] 현재 위치 마커/정확도 범위 표시
- [x] 권한 거부 시 오류 안내

## 6단계. 실제 맛집 검색 엔진

**목표:** Kakao Local REST API를 Next.js Route Handler에 연결해 실제 음식점/카페 데이터를 받는다.

### 구현 내용

- app/api/kakao/search/route.js를 생성하여 REST API Key가 브라우저에 노출되지 않도록 서버에서 호출
- 검색어가 있으면 keyword API, 없고 좌표가 있으면 category API 사용
- 음식점 FD6, 카페 CE7 카테고리 코드 사용
- lat/lng/radius가 있으면 거리순 검색, 기본 반경 3km
- 응답 데이터를 id/name/category/phone/address/roadAddress/latitude/longitude/distance/placeUrl 형태로 정규화
- RestaurantExplorer에서 실제 API를 호출하고 RestaurantList와 KakaoMap에 동일한 restaurants 배열을 전달
- 검색 결과를 지도 마커로 표시하고 검색된 장소가 보이도록 bounds 적용

### 관련 파일

- `app/api/kakao/search/route.js`
- `components/SearchBar.js`
- `components/CategoryFilter.js`
- `components/RestaurantExplorer.js`
- `components/RestaurantList.js`
- `components/RestaurantCard.js`
- `components/KakaoMap.js`

### 핵심 코드/설정

```text
const response = await fetch(kakaoUrl.toString(), {
  headers: { Authorization: `KakaoAK ${restApiKey}` },
  cache: "no-store",
});

const restaurants = data.documents.map((place) => ({
  id: place.id,
  name: place.place_name || "",
  category: place.category_name || "",
  phone: place.phone || "",
  roadAddress: place.road_address_name || "",
  latitude: Number(place.y),
  longitude: Number(place.x),
  distance: place.distance ? Number(place.distance) : null,
  placeUrl: place.place_url || "",
}));
```

### 완료 기준

- [x] 내 주변 실제 음식점 검색
- [x] 지역/맛집 키워드 검색
- [x] 카페 검색
- [x] 실제 주소/전화/거리/카카오맵 링크 표시
- [x] 지도에 실제 맛집 마커 표시

## 7단계. 지도·맛집목록 양방향 연동

**목표:** 맛집 카드와 지도 마커를 서로 연결하고 정보창 및 클러스터링을 적용한다.

### 구현 내용

- selectedRestaurantId를 RestaurantExplorer의 공용 상태로 관리
- 카드 클릭 → 해당 마커로 지도 이동 → 마커 zIndex 강조 → CustomOverlay 표시
- 마커 클릭 → 해당 맛집 선택 → 목록 자동 스크롤 → 선택 카드 강조
- CustomOverlay에는 상호명/주소/전화/카카오맵 상세 링크 표시
- MarkerClusterer로 지도 축소 시 가까운 마커들을 묶어 표시
- 새 검색 시 clusterer.clear()로 이전 마커를 제거해 잔상 방지

### 관련 파일

- `components/RestaurantExplorer.js`
- `components/RestaurantList.js`
- `components/RestaurantCard.js`
- `components/KakaoMap.js`

### 핵심 코드/설정

```text
kakao.maps.event.addListener(marker, "click", () => {
  onSelectRestaurant(restaurant);
  marker.setZIndex(20);
  map.panTo(position);
  showRestaurantOverlay(restaurant, position);
});

clusterer.addMarkers(markers);
```

### 완료 기준

- [x] 카드→지도 이동
- [x] 마커→카드 선택 및 자동 스크롤
- [x] 선택 상태 강조
- [x] CustomOverlay 표시
- [x] 클러스터링 작동

## 8단계. 맛집 목록 UI 고도화

**목표:** 실제 서비스 수준으로 카드, 로딩, 빈 결과, 모바일/PC 목록 UI를 다듬는다.

### 구현 내용

- 맛집 카드에 순번, 상호명, 간소화된 카테고리, 거리, 주소, 전화번호, 전화/카카오맵 버튼 표시
- 거리 m/km 자동 포맷팅
- 카카오 원본 카테고리(예: 음식점 > 한식 > 육류,고기요리)를 간결한 문자열로 표현
- 검색중에는 스켈레톤 카드 5개 표시
- 검색 결과가 없으면 Empty State 제공
- PC 목록 폭 약 420px, 모바일은 지도 아래 카드 목록으로 구성

### 관련 파일

- `components/RestaurantCard.js`
- `components/RestaurantList.js`
- `components/RestaurantExplorer.js`

### 핵심 코드/설정

```text
function formatDistance(distance) {
  const value = Number(distance);
  if (value < 1000) return `${Math.round(value)}m`;
  return `${(value / 1000).toFixed(1)}km`;
}

function getSimpleCategory(category = "") {
  const parts = category.split(">").map(v => v.trim()).filter(Boolean);
  return parts.length <= 1 ? (parts[0] || "음식점") : parts.slice(1).join(" · ");
}
```

### 완료 기준

- [x] 카드 정보 가독성 개선
- [x] 로딩/빈결과/선택 상태 구분
- [x] PC/모바일 목록 레이아웃 최적화

## 9단계. 검색·필터 고도화

**목표:** 음식종류, 검색반경, 지도 중심 재검색을 결합해 실제 지도 서비스처럼 검색한다.

### 구현 내용

- RadiusFilter 컴포넌트: 500m / 1km / 3km / 5km
- 전체·한식·중식·일식·양식·분식·고기·치킨·카페 필터 적용
- 지도 상단에 🔄 이 지역 검색 버튼을 두고 map.getCenter() 좌표로 재검색
- 검색어/카테고리/반경을 상태로 유지하여 지도를 이동해도 동일 조건으로 재검색
- 지도 좌측하단에 현재 검색 반경 표시

### 관련 파일

- `components/RadiusFilter.js`
- `components/RestaurantExplorer.js`
- `components/KakaoMap.js`

### 핵심 코드/설정

```text
function handleSearchCurrentArea() {
  const map = mapInstanceRef.current;
  const center = map.getCenter();
  onSearchArea?.({
    lat: center.getLat(),
    lng: center.getLng(),
  });
}
```

### 완료 기준

- [x] 반경 4단계 필터
- [x] 카테고리 필터
- [x] 지도 이동 후 이 지역 검색
- [x] 검색 조건 유지

## 10단계. 맛집 상세정보·길찾기

**목표:** 선택한 맛집의 상세 패널과 현재 위치 기준 길찾기 흐름을 제공한다.

### 구현 내용

- RestaurantDetail 컴포넌트로 상세 패널/모바일 바텀시트 구현
- 상호명, 카테고리, 거리, 도로명/지번주소, 전화번호 표시
- 전화하기 및 카카오맵 상세보기 연결
- 현재 위치가 있어야 길찾기를 활성화하고 없으면 위치 확인 안내
- 도보/대중교통 경로 조회용 서버 Route Handler를 구성
- 경로 결과에서 예상시간, 이동거리, 환승/요금(가능한 경우), 카카오맵 길찾기 URL 표시
- 자동차 경로는 별도 Kakao Mobility API 영역으로 분리하고 본 프로젝트 기본범위에서는 직접 계산하지 않는다.

### 관련 파일

- `app/api/kakao/route/route.js`
- `components/RestaurantDetail.js`
- `components/RestaurantExplorer.js`

### 핵심 코드/설정

```text
<RestaurantDetail
  restaurant={selectedRestaurant}
  currentLocation={location}
  onClose={() => setSelectedRestaurantId(null)}
/>
```

### 완료 기준

- [x] 맛집 상세패널
- [x] 전화/카카오맵 연결
- [x] 현재 위치 기반 길찾기
- [x] 예상 거리/시간 표시

## 11단계. LocalStorage 개인화 기능

**목표:** 별도 DB 없이 즐겨찾기, 최근 검색어, 최근 본 맛집을 브라우저에 저장한다.

### 구현 내용

- useLocalStorage Hook에서 최초 mount 후 브라우저 저장값을 읽어 hydration 오류 방지
- useFavorites Hook으로 즐겨찾기 추가/해제/조회 관리
- 최근 검색어는 중복 제거 후 최근순으로 최대 10개 저장
- 최근 본 맛집은 중복 제거 후 최근순으로 최대 20개 저장
- SavedPlacesPanel에서 찜/최근본곳/검색어 탭 제공
- 모바일 하단 찜 버튼과 PC 내 맛집 버튼을 패널에 연결

### 관련 파일

- `hooks/useLocalStorage.js`
- `hooks/useFavorites.js`
- `components/SavedPlacesPanel.js`
- `components/RestaurantCard.js`
- `components/RestaurantList.js`
- `components/RestaurantExplorer.js`
- `components/MobileNavigation.js`

### 핵심 코드/설정

```text
const [recentSearches, setRecentSearches] = useLocalStorage(
  "kakao-food-map:recent-searches", []
);

const [recentRestaurants, setRecentRestaurants] = useLocalStorage(
  "kakao-food-map:recent-restaurants", []
);
```

### 완료 기준

- [x] 즐겨찾기 새로고침 후 유지
- [x] 최근 검색어 저장
- [x] 최근 본 맛집 저장
- [x] DB/로그인 없이 개인화 기능 제공

## 12단계. 최종 점검·SEO·보안·배포

**목표:** 1~11단계를 통합 검증하고 배포 가능한 품질로 마무리한다.

### 구현 내용

- 중요 수정 1: 지역명 검색은 현재 GPS 반경에 묶이지 않도록 일반 키워드 검색으로 분리하고, 내 주변/이 지역 검색에서만 좌표+반경 사용
- 중요 수정 2: 즐겨찾기에서 선택한 장소가 현재 검색 results에 없어도 상세패널을 열 수 있도록 selectedRestaurant 객체 상태를 별도로 유지
- metadata, Open Graph, robots.js, sitemap.js 구성
- not-found.js 및 error.js 추가
- 보안 헤더(X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) 추가
- REST API Key는 절대 NEXT_PUBLIC_으로 만들지 않고 .env.local과 Vercel 환경변수로 관리
- npm run build → npm run start로 로컬 프로덕션 빌드 검증
- GitHub main 브랜치 푸시 후 Vercel Import
- Vercel 환경변수 등록 후 최종 Vercel 도메인을 Kakao Developers JavaScript SDK 도메인에 추가

### 관련 파일

- `app/layout.js`
- `app/robots.js`
- `app/sitemap.js`
- `app/not-found.js`
- `app/error.js`
- `next.config.mjs`
- `.gitignore`
- `.env.local`
- `README.md`

### 핵심 코드/설정

```text
npm run build
npm run start

git init
git add .
git commit -m "feat: complete kakao restaurant map app"
git branch -M main
git remote add origin https://github.com/사용자명/kakao-food-map.git
git push -u origin main
```

### 완료 기준

- [x] 프로덕션 빌드 성공
- [x] SEO/오류페이지/환경변수/보안 기본점검
- [x] GitHub 업로드
- [x] Vercel 배포 및 Kakao 도메인 등록

## 13. 최종 프로젝트 폴더 구조

```text
kakao-food-map/
├─ app/
│  ├─ api/
│  │  └─ kakao/
│  │     ├─ search/
│  │     │  └─ route.js
│  │     └─ route/
│  │        └─ route.js
│  ├─ error.js
│  ├─ not-found.js
│  ├─ robots.js
│  ├─ sitemap.js
│  ├─ layout.js
│  ├─ page.js
│  └─ globals.css
├─ components/
│  ├─ Header.js
│  ├─ SearchBar.js
│  ├─ CategoryFilter.js
│  ├─ RadiusFilter.js
│  ├─ KakaoMap.js
│  ├─ RestaurantExplorer.js
│  ├─ RestaurantList.js
│  ├─ RestaurantCard.js
│  ├─ RestaurantDetail.js
│  ├─ SavedPlacesPanel.js
│  └─ MobileNavigation.js
├─ hooks/
│  ├─ useGeolocation.js
│  ├─ useLocalStorage.js
│  └─ useFavorites.js
├─ lib/
├─ public/
├─ .env.local
├─ .gitignore
├─ next.config.mjs
├─ package.json
└─ README.md
```

## 14. 최종 기능 요약

| 영역 | 기능 |
|---|---|
| 지도 | Kakao Map, 이동/확대축소, 현재 중심, 맛집 마커, 클러스터 |
| 검색 | 지역/맛집 키워드, 음식점 FD6, 카페 CE7, 카테고리 필터 |
| 위치 | GPS 현재 위치, 정확도 표시, 500m/1km/3km/5km, 이 지역 검색 |
| 상세 | 상호/카테고리/거리/주소/전화/카카오맵 상세 |
| 길찾기 | 현재 위치 기준 도보/대중교통 경로 UI 및 카카오맵 연결 |
| 개인화 | 즐겨찾기, 최근 검색어, 최근 본 맛집(LocalStorage) |
| 운영 | SEO, robots/sitemap, 오류/404, 환경변수 보호, GitHub/Vercel |

## 15. 최종 환경변수

```env
NEXT_PUBLIC_KAKAO_MAP_KEY=카카오_JavaScript_KEY
KAKAO_REST_API_KEY=카카오_REST_API_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> `KAKAO_REST_API_KEY`에는 절대 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다.

## 16. GitHub / Vercel 배포 순서

```bash
npm run build
npm run start

git init
git add .
git commit -m "feat: complete kakao restaurant map app"
git branch -M main
git remote add origin https://github.com/사용자명/kakao-food-map.git
git push -u origin main
```

Vercel에서 GitHub 저장소를 Import한 뒤 환경변수를 등록하고 재배포합니다. 최종 Vercel 도메인은 Kakao Developers의 JavaScript SDK 허용 도메인에도 등록합니다.

## 17. 최종 배포 체크리스트

- [ ] npm run build가 오류 없이 완료되는가?
- [ ] localhost 프로덕션 실행(npm run start)에서도 지도가 표시되는가?
- [ ] JavaScript Key와 REST API Key가 서로 뒤바뀌지 않았는가?
- [ ] REST API Key가 GitHub/클라이언트 번들에 노출되지 않는가?
- [ ] 현재 위치 허용/거부 모두에서 사이트가 정상 동작하는가?
- [ ] 양산/부산/서울 등 다른 지역 키워드 검색이 GPS 위치에 묶이지 않는가?
- [ ] 지도 이동 후 이 지역 검색이 현재 지도 중심 기준으로 동작하는가?
- [ ] 마커 클릭 ↔ 카드 선택이 양방향으로 동작하는가?
- [ ] 모바일에서 지도/상세 바텀시트/하단 메뉴가 겹치지 않는가?
- [ ] 즐겨찾기/최근 검색/최근 본 맛집이 새로고침 후 유지되는가?
- [ ] Vercel 환경변수 3종이 등록되었는가?
- [ ] 최종 Vercel/커스텀 도메인이 Kakao JavaScript SDK 허용 도메인에 등록되었는가?

## 18. 운영 시 주의사항

- Next.js는 개발언어가 아니라 React 기반 프레임워크이며, 본 프로젝트는 Next.js + JavaScript 조합으로 구현한다.
- LocalStorage 데이터는 같은 브라우저/기기에서만 유지되며, 다른 기기와 자동 동기화되지 않는다.
- 카카오 API의 정책·엔드포인트·쿼터·응답 스키마는 운영 전 최신 공식문서에서 반드시 재확인한다.
- 자동차 경로를 사이트 내부에서 직접 계산하려면 Kakao Mobility Directions API 같은 별도 서비스 검토가 필요하다.
- Content-Security-Policy는 카카오맵이 사용하는 실제 도메인을 확인한 뒤 엄격하게 적용하는 것이 안전하다.

## 19. 다음 권장 작업

현재 문서는 1~12단계 설계/개발 기록을 통합한 MASTER SPEC입니다. 다음 작업은 단계별 예제 코드를 그대로 이어붙이는 것이 아니라 **중복을 제거한 최종 실행 프로젝트 소스**로 합치는 것입니다. 이때 `RestaurantExplorer.js`, `KakaoMap.js`, `RestaurantDetail.js`, API Route Handler를 중심으로 상태/의존성/오류처리를 한 번 더 통합 검증하는 것을 권장합니다.
