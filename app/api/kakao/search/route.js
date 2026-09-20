import { NextResponse } from "next/server";

const KAKAO_LOCAL_URL = "https://dapi.kakao.com/v2/local/search";
const MAX_RADIUS = 20000;

const CATEGORY_TERMS = {
  한식: ["한식", "국밥", "비빔밥", "갈비", "삼겹", "보쌈"],
  중식: ["중식", "중국", "짜장", "짬뽕", "마라"],
  일식: ["일식", "초밥", "스시", "라멘", "돈까스", "우동"],
  양식: ["양식", "파스타", "피자", "스테이크", "이탈리아"],
  분식: ["분식", "떡볶이", "김밥", "라면"],
  고기: ["고기", "구이", "갈비", "삼겹", "족발", "보쌈"],
  치킨: ["치킨", "닭", "통닭"],
  카페: ["카페", "coffee", "커피", "디저트"],
};

function numberParam(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizePlace(place) {
  return {
    id: place.id,
    name: place.place_name || "이름 없는 장소",
    category: place.category_name || place.category_group_name || "음식점",
    phone: place.phone || "",
    address: place.address_name || "",
    roadAddress: place.road_address_name || "",
    latitude: Number(place.y),
    longitude: Number(place.x),
    distance: place.distance ? Number(place.distance) : null,
    placeUrl: place.place_url || "",
  };
}

function isFoodPlace(place) {
  return ["FD6", "CE7"].includes(place.category_group_code) || /음식점|카페|커피/.test(place.category_name || "");
}

function matchesRequestedCategory(place, category) {
  if (!category || category === "전체") return true;
  const text = `${place.place_name || ""} ${place.category_name || ""}`.toLowerCase();
  return (CATEGORY_TERMS[category] || [category]).some((term) => text.includes(term.toLowerCase()));
}

export async function GET(request) {
  const restApiKey = process.env.KAKAO_REST_API_KEY;
  if (!restApiKey) {
    return NextResponse.json(
      { message: "KAKAO_REST_API_KEY가 설정되지 않았습니다.", code: "CONFIGURATION_REQUIRED" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") || "").trim().slice(0, 80);
  const category = (searchParams.get("category") || "전체").trim();
  const latitude = numberParam(searchParams.get("lat"));
  const longitude = numberParam(searchParams.get("lng"));
  const nearby = searchParams.get("nearby") === "true";
  const hasCoordinates = latitude !== null && longitude !== null;
  const requestedRadius = numberParam(searchParams.get("radius"));
  const radius = Math.min(Math.max(requestedRadius || 3000, 100), MAX_RADIUS);

  if (!query && !hasCoordinates) {
    return NextResponse.json({ message: "검색어 또는 지도 위치가 필요합니다." }, { status: 400 });
  }

  const isKeywordSearch = Boolean(query);
  const endpoint = isKeywordSearch ? "keyword.json" : "category.json";
  const kakaoUrl = new URL(`${KAKAO_LOCAL_URL}/${endpoint}`);
  kakaoUrl.searchParams.set("size", "15");

  if (isKeywordSearch) {
    // 지역/상호 검색은 기본적으로 전국 검색입니다. '이 지역 검색'일 때만 좌표를 붙입니다.
    const keyword = category !== "전체" ? `${query} ${category}` : query;
    kakaoUrl.searchParams.set("query", keyword);
  } else {
    kakaoUrl.searchParams.set("category_group_code", category === "카페" ? "CE7" : "FD6");
  }

  if (hasCoordinates && (!isKeywordSearch || nearby)) {
    kakaoUrl.searchParams.set("x", String(longitude));
    kakaoUrl.searchParams.set("y", String(latitude));
    kakaoUrl.searchParams.set("radius", String(radius));
    kakaoUrl.searchParams.set("sort", "distance");
  }

  try {
    const response = await fetch(kakaoUrl, {
      headers: { Authorization: `KakaoAK ${restApiKey}` },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Kakao Local API error", response.status);
      return NextResponse.json(
        { message: "카카오 장소 검색을 불러오지 못했습니다.", code: "KAKAO_API_ERROR" },
        { status: response.status >= 500 ? 502 : response.status },
      );
    }

    const data = await response.json();
    const restaurants = (data.documents || [])
      .filter(isFoodPlace)
      .filter((place) => matchesRequestedCategory(place, category))
      .map(normalizePlace);

    return NextResponse.json({
      restaurants,
      meta: {
        totalCount: data.meta?.total_count || restaurants.length,
        isEnd: data.meta?.is_end ?? true,
        searchedNearby: hasCoordinates && (!isKeywordSearch || nearby),
      },
    });
  } catch (error) {
    console.error("Kakao Local API request failed", error);
    return NextResponse.json(
      { message: "장소 검색 중 네트워크 오류가 발생했습니다.", code: "NETWORK_ERROR" },
      { status: 502 },
    );
  }
}
