'use client';

import { useEffect } from 'react';
import { useCameraStore } from '@/stores/cameraStore';
import type { Camera } from '@/lib/types';

export function useStatusChecker(cameras: Camera[]) {
  const { setOfflineCameras, offlineCameras } = useCameraStore();

  useEffect(() => {
    const checkYouTubeStatus = async (camera: Camera) => {
      if (camera.type !== 'youtube' || !camera.youtubeId) return;

      try {
        const response = await fetch(
          `/api/check-youtube?videoId=${camera.youtubeId}`
        );
        const data = await response.json();
        return data.isLive;
      } catch {
        return false;
      }
    };

    const checkAllCameras = async () => {
      const offline: string[] = [];

      for (const camera of cameras) {
        if (camera.type === 'youtube') {
          const isLive = await checkYouTubeStatus(camera);
          if (!isLive) {
            offline.push(camera.id);
          }
        }
        // iframe cameras assumed online
      }

      setOfflineCameras(offline);
    };

    if (cameras.length > 0) {
      checkAllCameras();
    }
  }, [cameras, setOfflineCameras]);

  return { offlineCameras };
}
