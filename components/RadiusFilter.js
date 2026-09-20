import { RADIUS_OPTIONS } from "@/lib/restaurant";

export default function RadiusFilter({ value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-bold text-stone-600">검색 반경</legend>
      <div className="grid grid-cols-4 rounded-xl bg-stone-100 p-1">
        {RADIUS_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              type="button"
              key={option.value}
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              className={`rounded-lg px-1 py-2 text-xs font-bold transition ${active ? "bg-white text-ink shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
