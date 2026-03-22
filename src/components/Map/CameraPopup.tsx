'use client';

import { useState, useEffect } from 'react';
import { Heart, ExternalLink, RefreshCw, Play, Video, Image as ImageIcon } from 'lucide-react';
import type { Camera } from '@/lib/types';
import { useCameraStore } from '@/stores/cameraStore';
import { cn } from '@/lib/utils';

interface CameraPopupProps {
  camera: Camera;
}

export function CameraPopup({ camera }: CameraPopupProps) {
  const { toggleFavorite, isFavorite, setSelectedCamera } = useCameraStore();
  const [imageKey, setImageKey] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const favorite = isFavorite(camera.id);

  // Auto-refresh image every 60 seconds (only for image type)
  useEffect(() => {
    if (camera.type !== 'image') return;

    const interval = setInterval(() => {
      setImageKey(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, [camera.type]);

  const handleRefresh = () => {
    if (camera.type !== 'image') return;
    setIsRefreshing(true);
    setImageKey(Date.now());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleWatchLive = () => {
    setSelectedCamera(camera);
  };

  // Get the thumbnail URL based on camera type
  const getThumbnailUrl = () => {
    switch (camera.type) {
      case 'youtube':
        return `https://img.youtube.com/vi/${camera.youtubeId}/mqdefault.jpg`;
      case 'image':
        return `${camera.imageUrl}?t=${imageKey}`;
      default:
        return null;
    }
  };

  const thumbnailUrl = getThumbnailUrl();

  // Render the preview content based on camera type
  const renderPreview = () => {
    switch (camera.type) {
      case 'youtube':
        return (
          <div className="relative w-full h-full">
            <img
              src={thumbnailUrl!}
              alt={camera.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-camera.svg';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
            </div>
          </div>
        );

      case 'iframe':
        return (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex flex-col items-center justify-center text-white">
            <Video className="w-10 h-10 mb-2" />
            <span className="text-xs font-medium">Live Stream</span>
            {camera.source && (
              <span className="text-xs opacity-75 mt-1">{camera.source}</span>
            )}
          </div>
        );

      case 'image':
      default:
        return (
          <img
            src={thumbnailUrl || '/placeholder-camera.svg'}
            alt={camera.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-camera.svg';
            }}
          />
        );
    }
  };

  return (
    <div className="p-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm text-gray-900 truncate flex-1">
          {camera.name}
        </h3>
        <div className="flex items-center gap-1 ml-2">
          {camera.type === 'image' && (
            <button
              onClick={handleRefresh}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Refresh image"
            >
              <RefreshCw
                className={cn('w-4 h-4 text-gray-500', isRefreshing && 'animate-spin')}
              />
            </button>
          )}
          <button
            onClick={() => toggleFavorite(camera.id)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={cn(
                'w-4 h-4',
                favorite ? 'fill-amber-500 text-amber-500' : 'text-gray-500'
              )}
            />
          </button>
        </div>
      </div>

      <div
        className="relative aspect-video bg-gray-100 rounded overflow-hidden mb-2 cursor-pointer group"
        onClick={handleWatchLive}
      >
        {renderPreview()}
        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
          {camera.road}
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
            Click to watch
          </span>
        </div>
      </div>

      {/* Source badge */}
      {camera.source && (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {camera.type === 'youtube' && <Play className="w-3 h-3 text-red-500" />}
            {camera.type === 'iframe' && <Video className="w-3 h-3 text-blue-500" />}
            {camera.type === 'image' && <ImageIcon className="w-3 h-3 text-green-500" />}
            {camera.source}
          </span>
        </div>
      )}

      {/* Watch Live button */}
      <button
        onClick={handleWatchLive}
        className="w-full mb-2 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors flex items-center justify-center gap-2"
      >
        <Play className="w-4 h-4" />
        Watch Live
      </button>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{camera.direction || 'N/A'}</span>
        <a
          href={`https://www.google.com/maps?q=${camera.latitude},${camera.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="w-3 h-3" />
          View on Maps
        </a>
      </div>
    </div>
  );
}
