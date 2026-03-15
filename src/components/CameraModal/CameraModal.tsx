'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { X, ExternalLink, RefreshCw, Video, Image, Globe, Radio, Share2, WifiOff } from 'lucide-react';
import type { Camera } from '@/lib/types';
import { useCameraStore } from '@/stores/cameraStore';
import { cn } from '@/lib/utils';
import Hls from 'hls.js';

const IMAGE_REFRESH_INTERVAL = 10000; // 10 seconds

export function CameraModal() {
  const { selectedCamera, setSelectedCamera } = useCameraStore();
  const [imageKey, setImageKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hlsError, setHlsError] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Auto-refresh for image type cameras
  useEffect(() => {
    if (!selectedCamera || selectedCamera.type !== 'image') return;

    const interval = setInterval(() => {
      setImageKey((prev) => prev + 1);
    }, IMAGE_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [selectedCamera]);

  // Reset states when camera changes
  useEffect(() => {
    setIsLoading(true);
    setHlsError(false);
  }, [selectedCamera]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCamera(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [setSelectedCamera]);

  // Initialize HLS stream
  useEffect(() => {
    if (!selectedCamera || selectedCamera.type !== 'hls' || !selectedCamera.hlsUrl) return;

    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(selectedCamera.hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS error:', data);
          setIsLoading(false);
          setHlsError(true);
        }
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = selectedCamera.hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(() => {});
      });
    }
  }, [selectedCamera, imageKey]);

  const handleClose = useCallback(() => {
    setSelectedCamera(null);
  }, [setSelectedCamera]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  const handleOpenInNewTab = useCallback(() => {
    if (!selectedCamera) return;

    let url: string | undefined;

    if (selectedCamera.type === 'youtube' && selectedCamera.youtubeId) {
      url = `https://www.youtube.com/watch?v=${selectedCamera.youtubeId}`;
    } else if (selectedCamera.pageUrl) {
      url = selectedCamera.pageUrl;
    } else if (selectedCamera.type === 'image' && selectedCamera.imageUrl) {
      url = selectedCamera.imageUrl;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [selectedCamera]);

  const handleManualRefresh = useCallback(() => {
    setImageKey((prev) => prev + 1);
    setIsLoading(true);
  }, []);

  const handleRetryHls = useCallback(() => {
    setHlsError(false);
    setIsLoading(true);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    // Trigger re-mount of HLS by toggling a key via imageKey (reused)
    setImageKey((prev) => prev + 1);
  }, []);

  const handleShare = useCallback(() => {
    if (!selectedCamera) return;
    const url = `${window.location.origin}${window.location.pathname}?cam=${selectedCamera.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [selectedCamera]);

  if (!selectedCamera) return null;

  const cameraType = selectedCamera.type || 'image';

  const getTypeIcon = () => {
    switch (cameraType) {
      case 'youtube':
        return <Video className="w-4 h-4" />;
      case 'iframe':
        return <Globe className="w-4 h-4" />;
      case 'hls':
        return <Radio className="w-4 h-4" />;
      case 'image':
      default:
        return <Image className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (selectedCamera.status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'checking':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const renderContent = () => {
    switch (cameraType) {
      case 'youtube':
        if (!selectedCamera.youtubeId) {
          return (
            <div className="flex items-center justify-center h-full bg-gray-900 text-white">
              <p>YouTube video ID not available</p>
            </div>
          );
        }
        return (
          <iframe
            src={`https://www.youtube.com/embed/${selectedCamera.youtubeId}?autoplay=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={selectedCamera.name}
          />
        );

      case 'iframe':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900 text-white p-8">
            <Globe className="w-16 h-16 mb-4 text-blue-400" />
            <h3 className="text-xl font-semibold mb-2">{selectedCamera.name}</h3>
            {selectedCamera.source && (
              <p className="text-gray-400 mb-4">Fonte: {selectedCamera.source}</p>
            )}
            <p className="text-gray-300 text-center mb-6 max-w-md">
              Esta camera nao permite visualizacao embutida. Clique no botao abaixo para assistir ao vivo em uma nova aba.
            </p>
            <button
              onClick={handleOpenInNewTab}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Abrir Camera ao Vivo
            </button>
          </div>
        );

      case 'hls':
        if (!selectedCamera.hlsUrl) {
          return (
            <div className="flex items-center justify-center h-full bg-gray-900 text-white">
              <p>HLS stream URL not available</p>
            </div>
          );
        }
        if (hlsError) {
          return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white gap-4">
              <WifiOff className="w-12 h-12 text-gray-500" />
              <p className="text-gray-400">Stream offline ou indisponível</p>
              <button
                onClick={handleRetryHls}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </button>
            </div>
          );
        }
        return (
          <div className="relative w-full h-full bg-gray-900">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
            <video
              key={imageKey}
              ref={videoRef}
              className="w-full h-full object-contain"
              controls
              autoPlay
              muted
              playsInline
            />
          </div>
        );

      case 'image':
      default:
        if (!selectedCamera.imageUrl) {
          return (
            <div className="flex items-center justify-center h-full bg-gray-900 text-white">
              <p>Image URL not available</p>
            </div>
          );
        }
        return (
          <div className="relative w-full h-full bg-gray-900">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
            <img
              key={imageKey}
              src={`${selectedCamera.imageUrl}${selectedCamera.imageUrl.includes('?') ? '&' : '?'}t=${imageKey}`}
              alt={selectedCamera.name}
              className={cn(
                'w-full h-full object-contain transition-opacity duration-300',
                isLoading ? 'opacity-0' : 'opacity-100'
              )}
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getTypeIcon()}
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedCamera.name}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {selectedCamera.source && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400">
                  {selectedCamera.source}
                </span>
              )}
              {selectedCamera.status && (
                <div className="flex items-center gap-1.5">
                  <span className={cn('w-2 h-2 rounded-full', getStatusColor())} />
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {selectedCamera.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cameraType === 'image' && (
              <button
                onClick={handleManualRefresh}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Refresh image"
              >
                <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
              </button>
            )}
            <button
              onClick={handleShare}
              className={cn(
                'p-2 rounded-lg transition-colors',
                copied
                  ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              title={copied ? 'Link copiado!' : 'Copiar link desta câmera'}
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="aspect-video bg-gray-900">{renderContent()}</div>

        {/* Footer with additional info */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>Road: {selectedCamera.road}</span>
              {selectedCamera.direction && <span>Direction: {selectedCamera.direction}</span>}
            </div>
            <span className="text-xs">
              Type: {cameraType.charAt(0).toUpperCase() + cameraType.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
