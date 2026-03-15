import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Camera, CameraFilters } from '@/lib/types';

interface CameraState {
  selectedCamera: Camera | null;
  favorites: string[];
  filters: CameraFilters;
  sidebarOpen: boolean;
  darkMode: boolean;
  offlineCameras: string[];
  showOnlineOnly: boolean;
  userLocation: { lat: number; lng: number } | null;

  // Actions
  setSelectedCamera: (camera: Camera | null) => void;
  toggleFavorite: (cameraId: string) => void;
  isFavorite: (cameraId: string) => boolean;
  setFilters: (filters: Partial<CameraFilters>) => void;
  resetFilters: () => void;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  setOfflineCameras: (ids: string[]) => void;
  toggleShowOnlineOnly: () => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
}

const defaultFilters: CameraFilters = {
  search: '',
  roads: [],
  showFavoritesOnly: false,
  showOnlineOnly: false,
};

export const useCameraStore = create<CameraState>()(
  persist(
    (set, get) => ({
      selectedCamera: null,
      favorites: [],
      filters: defaultFilters,
      sidebarOpen: true,
      darkMode: false,
      offlineCameras: [],
      showOnlineOnly: false,
      userLocation: null,

      setSelectedCamera: (camera) => set({ selectedCamera: camera }),

      toggleFavorite: (cameraId) =>
        set((state) => ({
          favorites: state.favorites.includes(cameraId)
            ? state.favorites.filter((id) => id !== cameraId)
            : [...state.favorites, cameraId],
        })),

      isFavorite: (cameraId) => get().favorites.includes(cameraId),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      setOfflineCameras: (ids) => set({ offlineCameras: ids }),

      toggleShowOnlineOnly: () => set((state) => ({ showOnlineOnly: !state.showOnlineOnly })),

      setUserLocation: (location) => set({ userLocation: location }),
    }),
    {
      name: 'dublin-cameras-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        darkMode: state.darkMode,
        showOnlineOnly: state.showOnlineOnly,
      }),
    }
  )
);
