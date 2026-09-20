"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import RadiusFilter from "@/components/RadiusFilter";
import KakaoMap from "@/components/KakaoMap";
import RestaurantList from "@/components/RestaurantList";
import RestaurantDetail from "@/components/RestaurantDetail";
import SavedPlacesPanel from "@/components/SavedPlacesPanel";
import MobileNavigation from "@/components/MobileNavigation";
import useFavorites from "@/hooks/useFavorites";
import useGeolocation from "@/hooks/useGeolocation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { DEFAULT_CENTER, createDemoRestaurants, matchesCategory } from "@/lib/restaurant";

const RECENT_SEARCHES_KEY = "kakao-food-map:recent-searches";
const RECENT_RESTAURANTS_KEY = "kakao-food-map:recent-restaurants";

function makeRestaurantSnapshot(restaurant) {
  return {
    id: restaurant.id,
    name: restaurant.name,
    category: restaurant.category,
    phone: restaurant.phone,
    address: restaurant.address,
    roadAddress: restaurant.roadAddress,
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
    distance: restaurant.distance,
    placeUrl: restaurant.placeUrl,
    viewedAt: new Date().toISOString(),
  };
}

export default function RestaurantExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [radius, setRadius] = useState(3000);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isSearching, setIsSearching] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isSavedPanelOpen, setIsSavedPanelOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage(RECENT_SEARCHES_KEY, []);
  const [recentRestaurants, setRecentRestaurants] = useLocalStorage(RECENT_RESTAURANTS_KEY, []);
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { location, error: locationError, isLocating, requestLocation } = useGeolocation();
  const latestRequestIdRef = useRef(0);
  const bootstrappedRef = useRef(false);

  const executeSearch = useCallback(async ({
    query = "",
    center = DEFAULT_CENTER,
    nearby = false,
    categoryOverride = category,
    radiusOverride = radius,
  } = {}) => {
    const requestId = ++latestRequestIdRef.current;
    const normalizedQuery = query.trim();
    const safeCenter = center || DEFAULT_CENTER;
    setIsSearching(true);
    setSearchError("");
    setIsDemo(false);
    setSelectedRestaurant(null);

    const params = new URLSearchParams({ category: categoryOverride, radius: String(radiusOverride) });
    if (normalizedQuery) params.set("query", normalizedQuery);
    if (!normalizedQuery || nearby) {
      params.set("lat", String(safeCenter.lat));
      params.set("lng", String(safeCenter.lng));
      params.set("nearby", "true");
    }

    try {
      const response = await fetch(`/api/kakao/search?${params.toString()}`);
      const payload = await response.json();
      if (requestId !== latestRequestIdRef.current) return;

      if (!response.ok) {
        if (payload.code === "CONFIGURATION_REQUIRED") {
          const demoResults = createDemoRestaurants(safeCenter).filter((restaurant) => matchesCategory(restaurant, categoryOverride));
          setRestaurants(demoResults);
          setIsDemo(true);
        } else {
          setRestaurants([]);
          setSearchError(payload.message || "맛집을 검색하지 못했어요. 잠시 후 다시 시도해 주세요.");
        }
        return;
      }

      const nextRestaurants = (payload.restaurants || []).filter((restaurant) => matchesCategory(restaurant, categoryOverride));
      setRestaurants(nextRestaurants);
      if (normalizedQuery) {
        setRecentSearches((previous) => [normalizedQuery, ...previous.filter((item) => item !== normalizedQuery)].slice(0, 10));
      }
    } catch (error) {
      if (requestId !== latestRequestIdRef.current) return;
      setRestaurants([]);
      setSearchError("네트워크 연결을 확인한 뒤 다시 검색해 주세요.");
    } finally {
      if (requestId === latestRequestIdRef.current) setIsSearching(false);
    }
  }, [category, radius, setRecentSearches]);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    executeSearch({ center: DEFAULT_CENTER, nearby: true });
  }, [executeSearch]);

  function handleSearch(nextQuery) {
    const normalizedQuery = nextQuery.trim();
    setSearchQuery(normalizedQuery);
    executeSearch({
      query: normalizedQuery,
      center: location || DEFAULT_CENTER,
      nearby: !normalizedQuery,
    });
  }

  async function handleNearby() {
    const nextLocation = await requestLocation();
    if (!nextLocation) return;
    executeSearch({ query: searchQuery, center: nextLocation, nearby: true });
  }

  function handleCategoryChange(nextCategory) {
    setCategory(nextCategory);
    executeSearch({
      query: searchQuery,
      center: location || DEFAULT_CENTER,
      nearby: !searchQuery,
      categoryOverride: nextCategory,
    });
  }

  function handleRadiusChange(nextRadius) {
    setRadius(nextRadius);
    if (!searchQuery) {
      executeSearch({
        center: location || DEFAULT_CENTER,
        nearby: true,
        radiusOverride: nextRadius,
      });
    }
  }

  function handleSearchArea(center) {
    executeSearch({ query: searchQuery, center, nearby: true });
  }

  function handleSelectRestaurant(restaurant) {
    if (!restaurant) return;
    setSelectedRestaurant(restaurant);
    const snapshot = makeRestaurantSnapshot(restaurant);
    setRecentRestaurants((previous) => [snapshot, ...previous.filter((item) => item.id !== restaurant.id)].slice(0, 20));
  }

  function handleSearchRecent(query) {
    setIsSavedPanelOpen(false);
    handleSearch(query);
  }

  const resultDescription = isSearching
    ? "맛집을 찾는 중이에요…"
    : isDemo
      ? "미리보기 맛집을 둘러보세요"
      : `${restaurants.length}곳을 찾았어요`;

  return (
    <main className="min-h-screen bg-stone-50 pb-24 lg:pb-8">
      <Header savedCount={favorites.length} onOpenSaved={() => setIsSavedPanelOpen(true)} />
      <SearchBar
        query={searchQuery}
        recentSearches={recentSearches}
        isLocating={isLocating}
        onSearch={handleSearch}
        onLocate={handleNearby}
        onSelectRecent={handleSearchRecent}
      />

      {(searchError || locationError) && (
        <div className="mx-auto mb-4 max-w-[1520px] px-4 sm:px-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-900">
            {searchError || locationError}
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[1600px] overflow-hidden border-y border-stone-200 bg-white lg:min-h-[620px] lg:grid-cols-[minmax(360px,420px)_1fr] lg:rounded-3xl lg:border">
        <aside className="order-2 flex min-h-0 flex-col border-t border-stone-200 bg-white lg:order-1 lg:border-r lg:border-t-0">
          <div className="border-b border-stone-100 p-4 sm:p-5">
            <CategoryFilter value={category} onChange={handleCategoryChange} />
            <div className="mt-4">
              <RadiusFilter value={radius} onChange={handleRadiusChange} />
            </div>
          </div>
          <div className="flex items-center justify-between px-4 pb-3 pt-4 sm:px-5">
            <h2 className="text-sm font-extrabold text-ink">{resultDescription}</h2>
            {!isSearching && !isDemo && <span className="text-xs text-stone-400">카드 또는 마커를 선택하세요</span>}
          </div>
          <div className="max-h-[620px] flex-1 overflow-y-auto px-4 pb-5 sm:px-5">
            <RestaurantList
              restaurants={restaurants}
              selectedRestaurantId={selectedRestaurant?.id}
              isSearching={isSearching}
              isDemo={isDemo}
              category={category}
              isFavorite={isFavorite}
              onSelect={handleSelectRestaurant}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        </aside>

        <section className="order-1 min-h-[350px] lg:order-2">
          <KakaoMap
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            currentLocation={location}
            radius={radius}
            onSelectRestaurant={handleSelectRestaurant}
            onSearchArea={handleSearchArea}
          />
        </section>
      </div>

      {selectedRestaurant && (
        <RestaurantDetail
          key={selectedRestaurant.id}
          restaurant={selectedRestaurant}
          currentLocation={location}
          isFavorite={isFavorite(selectedRestaurant.id)}
          onToggleFavorite={toggleFavorite}
          onClose={() => setSelectedRestaurant(null)}
        />
      )}

      {isSavedPanelOpen && (
        <SavedPlacesPanel
          favorites={favorites}
          recentRestaurants={recentRestaurants}
          recentSearches={recentSearches}
          onClose={() => setIsSavedPanelOpen(false)}
          onSelectRestaurant={(restaurant) => {
            setIsSavedPanelOpen(false);
            handleSelectRestaurant(restaurant);
          }}
          onSearchRecent={handleSearchRecent}
        />
      )}

      {!selectedRestaurant && (
        <MobileNavigation
          onNearby={handleNearby}
          onOpenSaved={() => setIsSavedPanelOpen(true)}
          onClearSelection={() => setSelectedRestaurant(null)}
        />
      )}
    </main>
  );
}
