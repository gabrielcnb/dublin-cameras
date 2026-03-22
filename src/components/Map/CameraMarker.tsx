'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Camera } from '@/lib/types';
import { useCameraStore } from '@/stores/cameraStore';
import { CameraPopup } from './CameraPopup';
import { useEffect, useState } from 'react';

// Create custom camera icon
const createCameraIcon = (isSelected: boolean, isFavorite: boolean) => {
  const color = isFavorite ? '#f59e0b' : isSelected ? '#3b82f6' : '#10b981';

  return L.divIcon({
    className: 'custom-camera-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface CameraMarkerProps {
  camera: Camera;
}

export function CameraMarker({ camera }: CameraMarkerProps) {
  const { selectedCamera, setSelectedCamera, isFavorite } = useCameraStore();
  const [icon, setIcon] = useState<L.DivIcon | null>(null);

  const isSelected = selectedCamera?.id === camera.id;
  const favorite = isFavorite(camera.id);

  useEffect(() => {
    setIcon(createCameraIcon(isSelected, favorite));
  }, [isSelected, favorite]);

  if (!icon) return null;

  return (
    <Marker
      position={[camera.latitude, camera.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => setSelectedCamera(camera),
      }}
    >
      <Popup maxWidth={350} minWidth={300}>
        <CameraPopup camera={camera} />
      </Popup>
    </Marker>
  );
}
