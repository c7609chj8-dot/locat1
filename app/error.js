"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-stone-50 p-6 text-center">
      <div>
        <p className="text-5xl">🥄</p>
        <h1 className="mt-5 text-2xl font-bold text-ink">잠시 문제가 생겼어요.</h1>
        <p className="mt-2 text-sm text-stone-500">한 번 더 시도해 주세요.</p>
        <button onClick={reset} className="mt-6 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white">
          다시 시도하기
        </button>
      </div>
    </main>
  );
}
