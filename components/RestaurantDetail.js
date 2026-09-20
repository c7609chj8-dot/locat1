"use client";

import { useState } from "react";
import { buildKakaoNavigationUrl, buildKakaoPlaceUrl, formatDistance, getSimpleCategory } from "@/lib/restaurant";

export default function RestaurantDetail({ restaurant, currentLocation, isFavorite, onToggleFavorite, onClose }) {
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeError, setRouteError] = useState("");
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  if (!restaurant) return null;

  async function showRoute() {
    if (!currentLocation) return;
    setIsLoadingRoute(true);
    setRouteError("");
    try {
      const params = new URLSearchParams({
        originLat: String(currentLocation.lat),
        originLng: String(currentLocation.lng),
        destinationLat: String(restaurant.latitude),
        destinationLng: String(restaurant.longitude),
        destinationName: restaurant.name,
      });
      const response = await fetch(`/api/kakao/route?${params}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "길찾기 정보를 가져오지 못했어요.");
      setRouteInfo(payload);
    } catch (error) {
      setRouteError(error.message || "길찾기 정보를 가져오지 못했어요.");
    } finally {
      setIsLoadingRoute(false);
    }
  }

  return (
    <section className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-xl rounded-t-3xl border border-stone-200 bg-white px-5 pb-7 pt-4 shadow-[0_-12px_40px_rgba(31,41,55,0.16)] sm:bottom-6 sm:right-6 sm:left-auto sm:w-[390px] sm:rounded-3xl">
      <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-stone-200 sm:hidden" />
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-orange-50 px-2 py-1 text-[11px] font-bold text-coral">{getSimpleCategory(restaurant.category)}</span>
            {restaurant.distance !== null && restaurant.distance !== undefined && <span className="text-xs font-extrabold text-coral">{formatDistance(restaurant.distance)}</span>}
          </div>
          <h2 className="mt-2 truncate text-xl font-extrabold tracking-tight text-ink">{restaurant.name}</h2>
        </div>
        <button onClick={() => onToggleFavorite(restaurant)} className={`grid h-9 w-9 place-items-center rounded-full text-lg ${isFavorite ? "bg-rose-50 text-rose-500" : "bg-stone-100 text-stone-400 hover:text-rose-400"}`} aria-label="즐겨찾기">
          {isFavorite ? "♥" : "♡"}
        </button>
        <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-stone-100 text-xl text-stone-500 hover:bg-stone-200" aria-label="상세 닫기">×</button>
      </div>

      <dl className="mt-4 space-y-2.5 border-y border-stone-100 py-4 text-sm">
        <div className="flex gap-3"><dt className="w-10 shrink-0 text-stone-400">주소</dt><dd className="leading-5 text-stone-700">{restaurant.roadAddress || restaurant.address || "주소 정보 없음"}</dd></div>
        <div className="flex gap-3"><dt className="w-10 shrink-0 text-stone-400">전화</dt><dd className="font-medium text-stone-700">{restaurant.phone || "전화번호 정보 없음"}</dd></div>
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {restaurant.phone ? (
          <a href={`tel:${restaurant.phone}`} className="rounded-xl bg-stone-100 px-3 py-3 text-center text-sm font-bold text-stone-700 transition hover:bg-stone-200">전화하기</a>
        ) : <span className="rounded-xl bg-stone-100 px-3 py-3 text-center text-sm font-bold text-stone-400">전화 정보 없음</span>}
        <a href={buildKakaoPlaceUrl(restaurant)} target="_blank" rel="noreferrer" className="rounded-xl bg-kakao px-3 py-3 text-center text-sm font-extrabold text-ink transition hover:brightness-95">카카오맵 보기</a>
      </div>

      <div className="mt-2">
        {currentLocation ? (
          <button onClick={showRoute} disabled={isLoadingRoute} className="w-full rounded-xl bg-ink px-3 py-3 text-sm font-bold text-white transition hover:bg-stone-800 disabled:cursor-wait disabled:opacity-60">
            {isLoadingRoute ? "도보 예상 시간 계산 중…" : "◎ 여기까지 길찾기"}
          </button>
        ) : (
          <p className="rounded-xl bg-amber-50 px-3 py-3 text-center text-xs leading-5 text-amber-800">내 위치를 확인하면 여기까지의 도보 예상 시간을 볼 수 있어요.</p>
        )}
      </div>

      {routeInfo && (
        <div className="mt-3 rounded-xl bg-stone-50 p-3 text-xs text-stone-600">
          <p><strong className="text-ink">도보 예상 {routeInfo.durationMinutes}분</strong> · 약 {formatDistance(routeInfo.distance)}</p>
          <p className="mt-1 leading-5 text-stone-400">{routeInfo.note}</p>
          <a href={routeInfo.navigationUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex font-bold text-coral hover:underline">카카오맵에서 정확한 길찾기 →</a>
        </div>
      )}
      {routeError && <p className="mt-3 text-xs text-rose-600">{routeError}</p>}

      {!routeInfo && currentLocation && (
        <a href={buildKakaoNavigationUrl(restaurant)} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-bold text-stone-500 underline underline-offset-4 hover:text-ink">카카오맵에서 바로 길찾기</a>
      )}
    </section>
  );
}
