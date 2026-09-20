import "./globals.css";

export const metadata = {
  title: "한입지도 | 내 주변 맛집 검색",
  description: "카카오맵 기반으로 내 주변과 원하는 지역의 맛집을 찾아보세요.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "한입지도 | 내 주변 맛집 검색",
    description: "지도에서 발견하는 오늘의 맛집",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
