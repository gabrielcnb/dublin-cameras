'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCameras } from '@/lib/api';
import type { Camera, CameraFilters } from '@/lib/types';
import { useCameraStore } from '@/stores/cameraStore';
import { useMemo } from 'react';

export function useCameras() {
  return useQuery({
    queryKey: ['cameras'],
    queryFn: fetchCameras,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

const NEARBY_RADIUS_KM = 5;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useFilteredCameras() {
  const { data: cameras = [], ...rest } = useCameras();
  const { filters, favorites, offlineCameras, showOnlineOnly, userLocation } = useCameraStore();

  const filteredCameras = useMemo(() => {
    return filterCameras(cameras, filters, favorites, offlineCameras, showOnlineOnly, userLocation);
  }, [cameras, filters, favorites, offlineCameras, showOnlineOnly, userLocation]);

  const roads = useMemo(() => {
    const roadSet = new Set(cameras.map((c) => c.road));
    return Array.from(roadSet).sort();
  }, [cameras]);

  const onlineCount = useMemo(() => {
    return cameras.filter((c) => !offlineCameras.includes(c.id)).length;
  }, [cameras, offlineCameras]);

  const offlineCount = useMemo(() => {
    return cameras.filter((c) => offlineCameras.includes(c.id)).length;
  }, [cameras, offlineCameras]);

  return {
    cameras: filteredCameras,
    allCameras: cameras,
    roads,
    onlineCount,
    offlineCount,
    ...rest,
  };
}

function filterCameras(
  cameras: Camera[],
  filters: CameraFilters,
  favorites: string[],
  offlineCameras: string[],
  showOnlineOnly: boolean,
  userLocation: { lat: number; lng: number } | null
): Camera[] {
  return cameras.filter((camera) => {
    // Filter by online status
    if (showOnlineOnly) {
      if (offlineCameras.includes(camera.id)) return false;
    }

    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchesSearch =
        camera.name.toLowerCase().includes(search) ||
        camera.road.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Filter by roads
    if (filters.roads.length > 0) {
      if (!filters.roads.includes(camera.road)) return false;
    }

    // Filter by favorites
    if (filters.showFavoritesOnly) {
      if (!favorites.includes(camera.id)) return false;
    }

    // Filter by proximity
    if (userLocation) {
      const dist = haversineKm(userLocation.lat, userLocation.lng, camera.latitude, camera.longitude);
      if (dist > NEARBY_RADIUS_KM) return false;
    }

    return true;
  });
}
