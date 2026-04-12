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
      const youtubeCameras = cameras.filter(c => c.type === 'youtube');

      const results = await Promise.allSettled(
        youtubeCameras.map(async (camera) => {
          const isLive = await checkYouTubeStatus(camera);
          return { id: camera.id, isLive };
        })
      );

      const offline: string[] = results
        .filter((r): r is PromiseFulfilledResult<{ id: string; isLive: boolean }> =>
          r.status === 'fulfilled' && !r.value.isLive
        )
        .map(r => r.value.id);

      setOfflineCameras(offline);
    };

    if (cameras.length > 0) {
      checkAllCameras();
    }
  }, [cameras, setOfflineCameras]);

  return { offlineCameras };
}
