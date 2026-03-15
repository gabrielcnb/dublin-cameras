'use client';

import { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMap } from 'react-leaflet';
import { CameraMarker } from './CameraMarker';
import type { Camera } from '@/lib/types';
import { useCameraStore } from '@/stores/cameraStore';
import 'leaflet/dist/leaflet.css';

const DUBLIN_CENTER: [number, number] = [53.3498, -6.2603];
const DEFAULT_ZOOM = 11;

type MapLayer = 'standard' | 'dark' | 'satellite' | 'transport';

const TILE_LAYERS: Record<MapLayer, { url: string; attribution: string; label: string }> = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    label: 'Standard',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    label: 'Dark',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    label: 'Satellite',
  },
  transport: {
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Humanitarian OpenStreetMap Team',
    label: 'Transport',
  },
};

interface MapContainerProps {
  cameras: Camera[];
  isLoading?: boolean;
}

function FlyToCamera() {
  const map = useMap();
  const { selectedCamera } = useCameraStore();

  useEffect(() => {
    if (selectedCamera) {
      map.flyTo([selectedCamera.latitude, selectedCamera.longitude], 14, {
        duration: 1,
      });
    }
  }, [selectedCamera, map]);

  return null;
}

function MapLayerControl({
  activeLayer,
  onSelect,
}: {
  activeLayer: MapLayer;
  onSelect: (layer: MapLayer) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
        title="Camada do mapa"
      >
        🗺 {TILE_LAYERS[activeLayer].label}
      </button>
      {open && (
        <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden min-w-[130px]">
          {(Object.keys(TILE_LAYERS) as MapLayer[]).map((key) => (
            <button
              key={key}
              onClick={() => { onSelect(key); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                activeLayer === key
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20'
                  : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              {TILE_LAYERS[key].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MapContainer({ cameras, isLoading }: MapContainerProps) {
  const [mounted, setMounted] = useState(false);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('standard');
  const { darkMode } = useCameraStore();

  // Sync darkMode toggle with map layer
  useEffect(() => {
    setActiveLayer((prev) => {
      if (darkMode && prev === 'standard') return 'dark';
      if (!darkMode && prev === 'dark') return 'standard';
      return prev;
    });
  }, [darkMode]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Carregando mapa...</div>
      </div>
    );
  }

  const { url, attribution } = TILE_LAYERS[activeLayer];

  return (
    <div className="relative w-full h-full">
      <LeafletMap
        center={DUBLIN_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full z-0"
        zoomControl={true}
      >
        <TileLayer key={activeLayer} url={url} attribution={attribution} />
        <FlyToCamera />
        {!isLoading &&
          cameras.map((camera) => (
            <CameraMarker key={camera.id} camera={camera} />
          ))}
      </LeafletMap>
      <MapLayerControl activeLayer={activeLayer} onSelect={setActiveLayer} />
    </div>
  );
}
