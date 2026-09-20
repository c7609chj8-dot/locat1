import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-stone-50 p-6 text-center">
      <div>
        <p className="text-5xl">🍜</p>
        <h1 className="mt-5 text-2xl font-bold text-ink">페이지를 찾지 못했어요.</h1>
        <p className="mt-2 text-sm text-stone-500">다시 맛있는 곳을 찾아볼까요?</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-white">
          맛집 찾으러 가기
        </Link>
      </div>
    </main>
  );
}
