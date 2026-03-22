export type CameraType = 'youtube' | 'iframe' | 'image' | 'hls';

export interface Camera {
  id: string;
  name: string;
  road: string;
  direction?: string;
  latitude: number;
  longitude: number;
  type: CameraType;
  // For YouTube embeds
  youtubeId?: string;
  // For iframe embeds (SkylineWebcams, etc)
  embedUrl?: string;
  pageUrl?: string;
  // For image-based cameras
  imageUrl?: string;
  // For HLS streams
  hlsUrl?: string;
  // Metadata
  source?: string;
  lastUpdated?: string;
  status: 'online' | 'offline' | 'checking';
}

export interface CameraFilters {
  search: string;
  roads: string[];
  showFavoritesOnly: boolean;
  showOnlineOnly: boolean;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
