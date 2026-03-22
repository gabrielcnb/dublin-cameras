'use client';

import type { Camera } from '@/lib/types';
import { CameraCard } from './CameraCard';

interface CameraListProps {
  cameras: Camera[];
  isLoading: boolean;
}

export function CameraList({ cameras, isLoading }: CameraListProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-800 rounded-lg h-24 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (cameras.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <p>Nenhuma camera encontrada</p>
        <p className="text-sm mt-1">Tente ajustar os filtros</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-2">
      {cameras.map((camera) => (
        <CameraCard key={camera.id} camera={camera} />
      ))}
    </div>
  );
}
