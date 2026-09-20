"use client";

import { useState } from "react";

export default function SearchBar({ query, recentSearches, isLocating, onSearch, onLocate, onSelectRecent }) {
  const [value, setValue] = useState(query || "");

  function submit(event) {
    event.preventDefault();
    onSearch(value.trim());
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-4 pt-6 sm:px-6 sm:pt-9">
      <div className="mb-4 text-center">
        <p className="text-sm font-bold text-coral">MAP YOUR MEAL</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">지금, 어디에서 먹을까요?</h1>
        <p className="mt-1 text-sm text-stone-500">동네나 먹고 싶은 메뉴를 검색해 보세요.</p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-stone-200 bg-white p-2 shadow-card sm:flex sm:items-center sm:gap-2">
        <label className="flex flex-1 items-center gap-2 px-3 py-2" aria-label="맛집 검색어">
          <span aria-hidden="true" className="text-lg">⌕</span>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="예: 성수 파스타, 부산 돼지국밥"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-stone-400"
          />
          {value && (
            <button type="button" onClick={() => setValue("")} className="grid h-6 w-6 place-items-center rounded-full text-stone-400 hover:bg-stone-100" aria-label="검색어 지우기">
              ×
            </button>
          )}
        </label>
        <div className="flex gap-2 border-t border-stone-100 pt-2 sm:border-0 sm:pt-0">
          <button
            type="button"
            onClick={onLocate}
            disabled={isLocating}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-stone-100 px-3 py-2.5 text-sm font-bold text-stone-700 transition hover:bg-stone-200 disabled:cursor-wait disabled:opacity-60 sm:flex-none"
          >
            <span aria-hidden="true">◎</span>{isLocating ? "위치 확인 중" : "내 주변"}
          </button>
          <button className="flex flex-1 items-center justify-center rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-stone-800 sm:flex-none">
            검색
          </button>
        </div>
      </form>

      {recentSearches?.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <span className="mr-1 text-stone-400">최근 검색</span>
          {recentSearches.slice(0, 5).map((recent) => (
            <button
              key={recent}
              onClick={() => {
                setValue(recent);
                onSelectRecent(recent);
              }}
              className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-stone-500 transition hover:border-stone-300 hover:text-ink"
            >
              {recent}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
