export const CATEGORIES = ["전체", "한식", "중식", "일식", "양식", "분식", "고기", "치킨", "카페"];

export const RADIUS_OPTIONS = [
  { label: "500m", value: 500 },
  { label: "1km", value: 1000 },
  { label: "3km", value: 3000 },
  { label: "5km", value: 5000 },
];

export const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978, label: "서울 시청" };

export function formatDistance(distance) {
  const value = Number(distance);
  if (!Number.isFinite(value) || value < 0) return "거리 정보 없음";
  if (value < 1000) return `${Math.round(value)}m`;
  return `${(value / 1000).toFixed(1)}km`;
}

export function getSimpleCategory(category = "") {
  const parts = category.split(">").map((value) => value.trim()).filter(Boolean);
  if (parts.length <= 1) return parts[0] || "음식점";
  return parts.slice(1).join(" · ");
}

export function matchesCategory(restaurant, category) {
  if (!category || category === "전체") return true;
  const text = `${restaurant.name || ""} ${restaurant.category || ""}`.toLowerCase();
  const aliases = {
    한식: ["한식", "국밥", "비빔밥", "갈비", "삼겹", "보쌈"],
    중식: ["중식", "중국", "짜장", "짬뽕", "마라"],
    일식: ["일식", "초밥", "스시", "라멘", "돈까스", "우동"],
    양식: ["양식", "파스타", "피자", "스테이크", "이탈리아"],
    분식: ["분식", "떡볶이", "김밥", "라면"],
    고기: ["고기", "구이", "갈비", "삼겹", "족발", "보쌈"],
    치킨: ["치킨", "닭", "통닭"],
    카페: ["카페", "coffee", "커피", "디저트"],
  };
  return (aliases[category] || [category]).some((term) => text.includes(term.toLowerCase()));
}

export function buildKakaoPlaceUrl(restaurant) {
  if (restaurant.placeUrl) return restaurant.placeUrl;
  if (!restaurant.latitude || !restaurant.longitude) return "https://map.kakao.com/";
  return `https://map.kakao.com/link/map/${encodeURIComponent(restaurant.name || "맛집")},${restaurant.latitude},${restaurant.longitude}`;
}

export function buildKakaoNavigationUrl(restaurant) {
  return `https://map.kakao.com/link/to/${encodeURIComponent(restaurant.name || "목적지")},${restaurant.latitude},${restaurant.longitude}`;
}

export function createDemoRestaurants(center = DEFAULT_CENTER) {
  const seed = [
    ["정담 국밥", "음식점 > 한식 > 국밥", "서울특별시 중구 세종대로 110", "02-000-1234", 0.0021, -0.0014],
    ["골목 파스타", "음식점 > 양식 > 이탈리아음식", "서울특별시 중구 덕수궁길 5", "02-000-2345", -0.0018, 0.0032],
    ["느린 오후 커피", "음식점 > 카페 > 커피전문점", "서울특별시 중구 세종대로20길 18", "02-000-3456", 0.0035, 0.001],
    ["소담 초밥", "음식점 > 일식 > 초밥,롤", "서울특별시 중구 남대문로 9", "02-000-4567", -0.0033, -0.0022],
    ["화끈 마라탕", "음식점 > 중식 > 마라탕", "서울특별시 중구 을지로 22", "02-000-5678", 0.0011, 0.0043],
    ["오늘의 떡볶이", "음식점 > 분식 > 떡볶이", "서울특별시 중구 무교로 11", "02-000-6789", -0.0041, 0.0017],
  ];

  return seed.map(([name, category, roadAddress, phone, latOffset, lngOffset], index) => ({
    id: `demo-${index + 1}`,
    name,
    category,
    phone,
    address: roadAddress,
    roadAddress,
    latitude: Number(center.lat) + latOffset,
    longitude: Number(center.lng) + lngOffset,
    distance: 160 + index * 210,
    placeUrl: "",
    isDemo: true,
  }));
}
