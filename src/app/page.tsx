'use client';

import dynamic from 'next/dynamic';
import { useFilteredCameras } from '@/hooks/useCameras';
import { useStatusChecker } from '@/hooks/useStatusChecker';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { CameraModal } from '@/components/CameraModal/CameraModal';
import { useCameraStore } from '@/stores/cameraStore';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Dynamic import for Leaflet (SSR disabled)
const MapContainer = dynamic(
  () => import('@/components/Map/MapContainer').then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Carregando mapa...</div>
      </div>
    ),
  }
);

function HomeContent() {
  const { cameras, allCameras, roads, isLoading, error } = useFilteredCameras();
  const { darkMode, setSelectedCamera } = useCameraStore();
  const searchParams = useSearchParams();

  // Check camera status on load
  useStatusChecker(allCameras ?? []);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Open camera from ?cam=ID URL param
  useEffect(() => {
    const camId = searchParams.get('cam');
    if (!camId || !allCameras || allCameras.length === 0) return;
    const camera = allCameras.find((c) => c.id === camId);
    if (camera) setSelectedCamera(camera);
  }, [searchParams, allCameras, setSelectedCamera]);

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Erro ao carregar cameras
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Nao foi possivel conectar ao servidor. Tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden relative">
      {/* Sidebar */}
      <Sidebar cameras={cameras} roads={roads} isLoading={isLoading} />

      {/* Map */}
      <div className="absolute inset-0">
        <MapContainer cameras={cameras} isLoading={isLoading} />
      </div>

      {/* Camera Modal - shows/hides based on selectedCamera in store */}
      <CameraModal />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
