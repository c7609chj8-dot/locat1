"use client";

import { useEffect } from "react";
import RestaurantCard from "@/components/RestaurantCard";

function SkeletonCard() {
  return <div className="h-36 animate-pulse rounded-2xl border border-stone-100 bg-stone-50" />;
}

export default function RestaurantList({ restaurants, selectedRestaurantId, isSearching, isDemo, category, isFavorite, onSelect, onToggleFavorite }) {
  useEffect(() => {
    if (!selectedRestaurantId) return;
    document.getElementById(`restaurant-card-${selectedRestaurantId}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedRestaurantId]);

  if (isSearching) {
    return <div className="space-y-3">{Array.from({ length: 5 }, (_, index) => <SkeletonCard key={index} />)}</div>;
  }

  if (!restaurants.length) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-5 py-12 text-center">
        <p className="text-3xl">🧭</p>
        <h3 className="mt-3 font-bold text-ink">검색 결과가 없어요.</h3>
        <p className="mt-1 text-xs leading-5 text-stone-500">다른 지역, 메뉴 또는 검색 반경으로 찾아보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isDemo && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
          <strong>미리보기 데이터</strong>를 표시 중입니다. 실제 검색을 사용하려면 카카오 API 키를 설정하세요.
        </div>
      )}
      {restaurants.map((restaurant, index) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          index={index}
          isSelected={selectedRestaurantId === restaurant.id}
          isFavorite={isFavorite(restaurant.id)}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
      {category !== "전체" && restaurants.length > 0 && <p className="px-1 text-center text-[11px] text-stone-400">{category} 조건에 맞는 결과예요.</p>}
    </div>
  );
}
