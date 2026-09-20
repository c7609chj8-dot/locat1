export default function MobileNavigation({ onNearby, onOpenSaved, onClearSelection }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-stone-200 bg-white/95 px-5 pb-[max(0.7rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden" aria-label="모바일 메뉴">
      <button onClick={onClearSelection} className="flex flex-1 flex-col items-center gap-1 text-xs font-bold text-stone-500"><span className="text-lg">⌂</span>홈</button>
      <button onClick={onNearby} className="flex flex-1 flex-col items-center gap-1 text-xs font-bold text-stone-500"><span className="text-lg">◎</span>내 주변</button>
      <button onClick={onOpenSaved} className="flex flex-1 flex-col items-center gap-1 text-xs font-bold text-stone-500"><span className="text-lg">♡</span>내 맛집</button>
    </nav>
  );
}
