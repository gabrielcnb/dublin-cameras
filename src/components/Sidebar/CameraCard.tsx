'use client';

import { Heart, MapPin } from 'lucide-react';
import type { Camera } from '@/lib/types';
import { useCameraStore } from '@/stores/cameraStore';
import { cn } from '@/lib/utils';

interface CameraCardProps {
  camera: Camera;
}

export function CameraCard({ camera }: CameraCardProps) {
  const { selectedCamera, setSelectedCamera, toggleFavorite, isFavorite } =
    useCameraStore();

  const isSelected = selectedCamera?.id === camera.id;
  const favorite = isFavorite(camera.id);

  return (
    <div
      onClick={() => setSelectedCamera(camera)}
      className={cn(
        'relative p-3 rounded-lg cursor-pointer transition-all',
        isSelected
          ? 'bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-500'
          : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {camera.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400">
              {camera.road}
            </span>
            {camera.direction && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {camera.direction}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(camera.id);
          }}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          title={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            className={cn(
              'w-4 h-4',
              favorite ? 'fill-amber-500 text-amber-500' : 'text-gray-400'
            )}
          />
        </button>
      </div>

      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
        <MapPin className="w-3 h-3" />
        <span>
          {camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
