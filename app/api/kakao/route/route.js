import { NextResponse } from "next/server";

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function haversineMeters(lat1, lng1, lat2, lng2) {
  const toRadians = (degree) => (degree * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const originLat = toNumber(searchParams.get("originLat"));
  const originLng = toNumber(searchParams.get("originLng"));
  const destinationLat = toNumber(searchParams.get("destinationLat"));
  const destinationLng = toNumber(searchParams.get("destinationLng"));
  const destinationName = (searchParams.get("destinationName") || "목적지").slice(0, 80);

  if ([originLat, originLng, destinationLat, destinationLng].some((value) => value === null)) {
    return NextResponse.json({ message: "출발지와 목적지 좌표가 필요합니다." }, { status: 400 });
  }

  const straightLineDistance = haversineMeters(originLat, originLng, destinationLat, destinationLng);
  const estimatedWalkingDistance = Math.round(straightLineDistance * 1.2);
  const estimatedMinutes = Math.max(1, Math.round(estimatedWalkingDistance / 75));
  const navigationUrl = `https://map.kakao.com/link/to/${encodeURIComponent(destinationName)},${destinationLat},${destinationLng}`;

  return NextResponse.json({
    distance: estimatedWalkingDistance,
    durationMinutes: estimatedMinutes,
    navigationUrl,
    note: "직선거리 기반의 도보 예상치입니다. 정확한 경로와 대중교통 정보는 카카오맵에서 확인하세요.",
  });
}
