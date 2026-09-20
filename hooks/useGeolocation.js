"use client";

import { useCallback, useState } from "react";

const GEOLOCATION_ERRORS = {
  1: "위치 권한이 꺼져 있어요. 브라우저 설정에서 위치 접근을 허용해 주세요.",
  2: "현재 위치를 확인할 수 없어요. 잠시 뒤 다시 시도해 주세요.",
  3: "위치 확인 시간이 초과되었어요. 다시 시도해 주세요.",
};

export default function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      const message = "이 브라우저는 현재 위치 기능을 지원하지 않아요.";
      setError(message);
      return Promise.resolve(null);
    }

    setError("");
    setIsLocating(true);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(nextLocation);
          setIsLocating(false);
          resolve(nextLocation);
        },
        (positionError) => {
          setError(GEOLOCATION_ERRORS[positionError.code] || "위치 정보를 가져오지 못했어요.");
          setIsLocating(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
      );
    });
  }, []);

  return { location, error, isLocating, requestLocation };
}
