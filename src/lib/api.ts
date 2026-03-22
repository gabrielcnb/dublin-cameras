import type { Camera } from './types';

const API_BASE = '/api';

export async function fetchCameras(): Promise<Camera[]> {
  const response = await fetch(`${API_BASE}/cameras`, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cameras');
  }

  return response.json();
}

export async function fetchCameraImage(cameraId: string): Promise<string> {
  // Returns the image URL with cache-busting timestamp
  return `${API_BASE}/cameras/${cameraId}/image?t=${Date.now()}`;
}
