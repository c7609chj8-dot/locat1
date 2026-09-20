"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

function isValidPosition(restaurant) {
  return Number.isFinite(Number(restaurant?.latitude)) && Number.isFinite(Number(restaurant?.longitude));
}

function createOverlayContent(restaurant) {
  const content = document.createElement("div");
  content.className = "map-overlay";

  const name = document.createElement("strong");
  name.textContent = restaurant.name;
  content.appendChild(name);

  const address = document.createElement("span");
  address.textContent = restaurant.roadAddress || restaurant.address || "주소 정보 없음";
  content.appendChild(address);

  return content;
}

export default function KakaoMap({ restaurants, selectedRestaurant, currentLocation, radius, onSelectRestaurant, onSearchArea }) {
  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerByIdRef = useRef(new Map());
  const clustererRef = useRef(null);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const overlayRef = useRef(null);
  const initializingRef = useRef(false);
  const selectCallbackRef = useRef(onSelectRestaurant);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    selectCallbackRef.current = onSelectRestaurant;
  }, [onSelectRestaurant]);

  const clearRestaurantMarkers = useCallback(() => {
    clustererRef.current?.clear();
    markerByIdRef.current.forEach((marker) => marker.setMap(null));
    markerByIdRef.current = new Map();
  }, []);

  const showOverlay = useCallback((restaurant, shouldPan = true) => {
    const maps = window.kakao?.maps;
    const map = mapRef.current;
    if (!maps || !map || !isValidPosition(restaurant)) return;

    overlayRef.current?.setMap(null);
    markerByIdRef.current.forEach((marker) => marker.setZIndex(1));

    const position = new maps.LatLng(Number(restaurant.latitude), Number(restaurant.longitude));
    const marker = markerByIdRef.current.get(restaurant.id);
    marker?.setZIndex(20);
    if (shouldPan) map.panTo(position);

    overlayRef.current = new maps.CustomOverlay({
      position,
      content: createOverlayContent(restaurant),
      yAnchor: 1.18,
      zIndex: 30,
    });
    overlayRef.current.setMap(map);
  }, []);

  const initializeMap = useCallback(() => {
    const maps = window.kakao?.maps;
    if (!maps || !containerRef.current || mapRef.current || initializingRef.current) return;
    initializingRef.current = true;

    maps.load(() => {
      if (!containerRef.current || mapRef.current) return;
      try {
        const initialCenter = new maps.LatLng(37.5665, 126.978);
        const map = new maps.Map(containerRef.current, { center: initialCenter, level: 5 });
        map.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT);
        map.addControl(new maps.MapTypeControl(), maps.ControlPosition.TOPRIGHT);

        mapRef.current = map;
        if (maps.MarkerClusterer) {
          clustererRef.current = new maps.MarkerClusterer({
            map,
            averageCenter: true,
            minLevel: 6,
            disableClickZoom: false,
          });
        }
        setIsMapReady(true);
      } catch (error) {
        console.error("Could not initialize Kakao Map", error);
        setMapError("카카오 지도를 불러오지 못했어요. 앱 키와 허용 도메인을 확인해 주세요.");
      } finally {
        initializingRef.current = false;
      }
    });
  }, []);

  useEffect(() => {
    if (apiKey && window.kakao?.maps) initializeMap();
  }, [apiKey, initializeMap]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !window.kakao?.maps) return;
    const maps = window.kakao.maps;

    userMarkerRef.current?.setMap(null);
    accuracyCircleRef.current?.setMap(null);
    userMarkerRef.current = null;
    accuracyCircleRef.current = null;

    if (!currentLocation) return;
    const position = new maps.LatLng(currentLocation.lat, currentLocation.lng);
    userMarkerRef.current = new maps.Marker({ position, title: "현재 위치", zIndex: 40 });
    userMarkerRef.current.setMap(mapRef.current);
    accuracyCircleRef.current = new maps.Circle({
      center: position,
      radius: Math.max(Math.min(currentLocation.accuracy || 30, 500), 30),
      strokeWeight: 1,
      strokeColor: "#2563EB",
      strokeOpacity: 0.7,
      strokeStyle: "solid",
      fillColor: "#60A5FA",
      fillOpacity: 0.18,
      zIndex: 1,
    });
    accuracyCircleRef.current.setMap(mapRef.current);
    mapRef.current.setCenter(position);
    mapRef.current.setLevel(Math.min(mapRef.current.getLevel(), 4));
  }, [currentLocation, isMapReady]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !window.kakao?.maps) return;
    const maps = window.kakao.maps;
    clearRestaurantMarkers();
    overlayRef.current?.setMap(null);

    const places = restaurants.filter(isValidPosition);
    if (!places.length) return;

    const bounds = new maps.LatLngBounds();
    const markers = places.map((restaurant) => {
      const position = new maps.LatLng(Number(restaurant.latitude), Number(restaurant.longitude));
      const marker = new maps.Marker({ position, title: restaurant.name, zIndex: 1 });
      markerByIdRef.current.set(restaurant.id, marker);
      bounds.extend(position);
      maps.event.addListener(marker, "click", () => {
        selectCallbackRef.current?.(restaurant);
        showOverlay(restaurant, true);
      });
      return marker;
    });

    if (clustererRef.current) clustererRef.current.addMarkers(markers);
    else markers.forEach((marker) => marker.setMap(mapRef.current));

    if (markers.length === 1) {
      mapRef.current.setCenter(bounds.getSouthWest());
      mapRef.current.setLevel(4);
    } else {
      mapRef.current.setBounds(bounds, 55, 55, 55, 55);
    }
  }, [restaurants, isMapReady, clearRestaurantMarkers, showOverlay]);

  useEffect(() => {
    if (selectedRestaurant) showOverlay(selectedRestaurant, true);
    else overlayRef.current?.setMap(null);
  }, [selectedRestaurant, showOverlay]);

  useEffect(() => () => {
    clearRestaurantMarkers();
    userMarkerRef.current?.setMap(null);
    accuracyCircleRef.current?.setMap(null);
    overlayRef.current?.setMap(null);
  }, [clearRestaurantMarkers]);

  function searchCurrentArea() {
    const map = mapRef.current;
    if (!map) return;
    const center = map.getCenter();
    onSearchArea?.({ lat: center.getLat(), lng: center.getLng() });
  }

  const unavailable = !apiKey || Boolean(mapError);

  return (
    <div className="relative h-full min-h-[350px] overflow-hidden bg-[#e9eee9] lg:min-h-[620px]">
      {apiKey && (
        <Script
          id="kakao-map-sdk"
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services,clusterer`}
          strategy="afterInteractive"
          onLoad={initializeMap}
          onError={() => setMapError("카카오 지도 스크립트를 불러오지 못했어요.")}
        />
      )}
      <div ref={containerRef} className="absolute inset-0" aria-label="맛집 지도" />

      {unavailable && (
        <div className="map-placeholder absolute inset-0 grid place-items-center p-6 text-center">
          <div className="max-w-xs rounded-3xl bg-white/90 p-5 shadow-soft backdrop-blur">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-kakao text-xl">🗺️</div>
            <p className="mt-3 text-sm font-extrabold text-ink">카카오 지도 미리보기</p>
            <p className="mt-1 text-xs leading-5 text-stone-500">`.env.local`에 JavaScript 키를 넣고 카카오 Developers에 현재 도메인을 등록하면 실제 지도가 표시됩니다.</p>
          </div>
          <span className="map-demo-pin map-demo-pin-one">🍜</span>
          <span className="map-demo-pin map-demo-pin-two">☕</span>
          <span className="map-demo-pin map-demo-pin-three">🍣</span>
        </div>
      )}

      {!unavailable && !isMapReady && <div className="absolute inset-0 grid place-items-center bg-stone-100 text-sm font-bold text-stone-500">지도 불러오는 중…</div>}

      <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
        <button
          onClick={searchCurrentArea}
          disabled={!isMapReady}
          className="rounded-xl bg-white px-3.5 py-2.5 text-xs font-extrabold text-ink shadow-card transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ↻ 이 지역 검색
        </button>
      </div>
      <div className="absolute bottom-3 left-3 z-10 rounded-lg bg-stone-900/80 px-2.5 py-1.5 text-[11px] font-medium text-white">
        현재 검색 반경 {radius < 1000 ? `${radius}m` : `${radius / 1000}km`}
      </div>
      {restaurants.length > 0 && <div className="absolute bottom-3 right-3 z-10 rounded-lg bg-white/90 px-2.5 py-1.5 text-[11px] font-bold text-stone-600 shadow-sm">맛집 {restaurants.length}곳</div>}
    </div>
  );
}
