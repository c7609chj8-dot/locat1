"use client";

import { buildKakaoPlaceUrl, formatDistance, getSimpleCategory } from "@/lib/restaurant";

export default function RestaurantCard({ restaurant, index, isSelected, isFavorite, onSelect, onToggleFavorite }) {
  function activateCard() {
    onSelect(restaurant);
  }

  function onKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateCard();
    }
  }

  return (
    <article
      id={`restaurant-card-${restaurant.id}`}
      role="button"
      tabIndex={0}
      onClick={activateCard}
      onKeyDown={onKeyDown}
      className={`group cursor-pointer rounded-2xl border p-4 text-left transition ${isSelected ? "border-coral bg-orange-50/60 shadow-card" : "border-stone-200 bg-white hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-card"}`}
    >
      <div className="flex items-start gap-3">
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${isSelected ? "bg-coral text-white" : "bg-stone-100 text-stone-500"}`}>{index + 1}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 flex-1 truncate text-[15px] font-extrabold text-ink">{restaurant.name}</h3>
            <button
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite(restaurant);
              }}
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-base transition ${isFavorite ? "bg-rose-50 text-rose-500" : "text-stone-300 hover:bg-stone-100 hover:text-rose-400"}`}
              aria-label={isFavorite ? `${restaurant.name} 즐겨찾기 해제` : `${restaurant.name} 즐겨찾기 추가`}
              aria-pressed={isFavorite}
            >
              {isFavorite ? "♥" : "♡"}
            </button>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="truncate text-xs font-medium text-stone-500">{getSimpleCategory(restaurant.category)}</span>
            {restaurant.distance !== null && restaurant.distance !== undefined && <span className="shrink-0 text-xs font-extrabold text-coral">{formatDistance(restaurant.distance)}</span>}
          </div>
          <p className="mt-2 line-clamp-1 text-xs leading-5 text-stone-500">{restaurant.roadAddress || restaurant.address || "주소 정보 없음"}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2 border-t border-stone-100 pt-3">
        {restaurant.phone ? (
          <a onClick={(event) => event.stopPropagation()} href={`tel:${restaurant.phone}`} className="flex-1 rounded-lg bg-stone-100 px-2 py-2 text-center text-xs font-bold text-stone-600 transition hover:bg-stone-200">
            전화
          </a>
        ) : <span className="flex-1 rounded-lg bg-stone-50 px-2 py-2 text-center text-xs font-medium text-stone-400">전화 정보 없음</span>}
        <a
          onClick={(event) => event.stopPropagation()}
          href={buildKakaoPlaceUrl(restaurant)}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-lg bg-kakao px-2 py-2 text-center text-xs font-extrabold text-ink transition hover:brightness-95"
        >
          카카오맵
        </a>
      </div>
    </article>
  );
}
