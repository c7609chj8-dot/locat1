"use client";

import { useCallback } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";

const FAVORITES_KEY = "kakao-food-map:favorites";

export default function useFavorites() {
  const [favorites, setFavorites, isReady] = useLocalStorage(FAVORITES_KEY, []);

  const isFavorite = useCallback(
    (restaurantId) => favorites.some((restaurant) => restaurant.id === restaurantId),
    [favorites],
  );

  const toggleFavorite = useCallback((restaurant) => {
    if (!restaurant?.id) return;
    setFavorites((previous) => {
      const exists = previous.some((item) => item.id === restaurant.id);
      if (exists) return previous.filter((item) => item.id !== restaurant.id);
      const snapshot = {
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
        savedAt: new Date().toISOString(),
      };
      return [snapshot, ...previous].slice(0, 100);
    });
  }, [setFavorites]);

  return { favorites, isFavorite, toggleFavorite, isReady };
}
