import { CATEGORIES } from "@/lib/restaurant";

const categoryIcons = {
  전체: "✦",
  한식: "🍚",
  중식: "🥟",
  일식: "🍣",
  양식: "🍝",
  분식: "🌶️",
  고기: "🥩",
  치킨: "🍗",
  카페: "☕",
};

export default function CategoryFilter({ value, onChange }) {
  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1" aria-label="음식 종류 필터">
      {CATEGORIES.map((category) => {
        const active = category === value;
        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            aria-pressed={active}
            className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold transition ${active ? "border-ink bg-ink text-white" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"}`}
          >
            <span className="mr-1" aria-hidden="true">{categoryIcons[category]}</span>{category}
          </button>
        );
      })}
    </div>
  );
}
