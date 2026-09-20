"use client";

import { useState } from "react";
import { getSimpleCategory } from "@/lib/restaurant";

const tabs = [
  { id: "favorites", label: "찜한 곳" },
  { id: "recentRestaurants", label: "최근 본 곳" },
  { id: "recentSearches", label: "최근 검색" },
];

function EmptyTab({ children }) {
  return <div className="grid min-h-52 place-items-center px-6 text-center text-sm leading-6 text-stone-500">{children}</div>;
}

export default function SavedPlacesPanel({ favorites, recentRestaurants, recentSearches, onClose, onSelectRestaurant, onSearchRecent }) {
  const [activeTab, setActiveTab] = useState("favorites");
  const places = activeTab === "favorites" ? favorites : recentRestaurants;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="내 맛집">
      <button className="absolute inset-0 cursor-default bg-stone-950/30 backdrop-blur-[1px]" onClick={onClose} aria-label="패널 닫기" />
      <section className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-5">
          <div>
            <p className="text-xs font-bold text-coral">MY FOOD MAP</p>
            <h2 className="mt-0.5 text-xl font-extrabold text-ink">내 맛집</h2>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-stone-100 text-xl text-stone-600 hover:bg-stone-200" aria-label="닫기">×</button>
        </div>

        <div className="grid grid-cols-3 gap-1 border-b border-stone-200 px-4 pt-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-1 py-3 text-xs font-bold transition ${activeTab === tab.id ? "border-ink text-ink" : "border-transparent text-stone-400 hover:text-stone-600"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "recentSearches" ? (
            recentSearches.length ? (
              <div className="space-y-2">
                {recentSearches.map((query) => (
                  <button
                    key={query}
                    onClick={() => onSearchRecent(query)}
                    className="flex w-full items-center gap-3 rounded-xl border border-stone-200 px-4 py-3 text-left transition hover:border-stone-300 hover:bg-stone-50"
                  >
                    <span className="text-stone-400">⌕</span>
                    <span className="flex-1 truncate text-sm font-bold text-stone-700">{query}</span>
                    <span className="text-xs text-stone-400">다시 검색</span>
                  </button>
                ))}
              </div>
            ) : <EmptyTab>검색한 지역이나 메뉴가 여기에 쌓여요.</EmptyTab>
          ) : places.length ? (
            <div className="space-y-2">
              {places.map((restaurant) => (
                <button
                  key={`${activeTab}-${restaurant.id}`}
                  onClick={() => onSelectRestaurant(restaurant)}
                  className="w-full rounded-xl border border-stone-200 p-4 text-left transition hover:border-stone-300 hover:bg-stone-50"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-rose-500">{activeTab === "favorites" ? "♥" : "◷"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-ink">{restaurant.name}</p>
                      <p className="mt-1 truncate text-xs text-stone-500">{getSimpleCategory(restaurant.category)}</p>
                      <p className="mt-1 truncate text-xs text-stone-400">{restaurant.roadAddress || restaurant.address || "주소 정보 없음"}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : <EmptyTab>{activeTab === "favorites" ? "마음에 드는 곳의 ♡ 버튼을 누르면 여기에서 다시 볼 수 있어요." : "방문한 맛집을 선택하면 최근 본 곳에 저장돼요."}</EmptyTab>}
        </div>

        <p className="border-t border-stone-100 px-5 py-4 text-[11px] leading-5 text-stone-400">저장 정보는 이 브라우저에만 보관됩니다.</p>
      </section>
    </div>
  );
}
