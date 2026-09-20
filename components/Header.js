export default function Header({ savedCount = 0, onOpenSaved }) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2.5 text-left" aria-label="한입지도 처음으로">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-kakao text-lg shadow-sm">🍴</span>
          <span>
            <span className="block text-base font-extrabold tracking-tight text-ink">한입지도</span>
            <span className="hidden text-[11px] font-medium text-stone-400 sm:block">오늘, 가까운 맛집 한 곳</span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-500 sm:inline-flex">카카오맵 기반</span>
          <button
            onClick={onOpenSaved}
            className="relative inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-2 text-sm font-bold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
          >
            <span aria-hidden="true">♡</span>
            <span>내 맛집</span>
            {savedCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-[10px] text-white">{savedCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
