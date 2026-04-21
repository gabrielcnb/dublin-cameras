import { NextResponse } from 'next/server';
import type { Camera } from '@/lib/types';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import fallbackCameras from '@/data/cameras-fallback.json';

// GraphQL query to fetch cameras from TII
const CAMERAS_QUERY = `
  query GetCameras($page: Int, $pageSize: Int) {
    cameras(page: $page, pageSize: $pageSize) {
      items {
        id
        name
        road
        direction
        location {
          latitude
          longitude
        }
        imageUrl
        lastUpdated
        status
      }
      totalCount
    }
  }
`;

async function fetchFromTII(): Promise<Camera[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://traffic.tii.ie/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: CAMERAS_QUERY,
        variables: { page: 1, pageSize: 300 },
      }),
      signal: controller.signal,
      next: { revalidate: 60 },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`TII API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL error: ${data.errors[0]?.message}`);
    }

    // Transform the response to our Camera type
    const cameras: Camera[] = data.data.cameras.items.map((item: {
      id: string;
      name: string;
      road?: string;
      direction?: string;
      location: { latitude: number; longitude: number };
      imageUrl: string;
      lastUpdated?: string;
      status?: string;
    }) => ({
      id: item.id,
      name: item.name,
      road: item.road || extractRoadFromName(item.name),
      direction: item.direction,
      latitude: item.location.latitude,
      longitude: item.location.longitude,
      imageUrl: item.imageUrl,
      lastUpdated: item.lastUpdated,
      status: item.status === 'ONLINE' ? 'online' : 'offline',
    }));

    return cameras;
  } catch (error) {
    console.error('Failed to fetch from TII:', error);
    return [];
  }
}

function extractRoadFromName(name: string): string {
  const match = name.match(/^([MN]\d+)/i);
  return match ? match[1].toUpperCase() : 'Other';
}

export async function GET(request: Request) {
  // Rate limiting: 30 requests per minute per IP
  const ip = getClientIP(request);
  const { allowed, remaining } = checkRateLimit(`cameras:${ip}`, 30, 60_000);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  // Try to fetch from TII API first
  let cameras = await fetchFromTII();

  // If TII API fails or returns empty, use fallback data
  if (cameras.length === 0) {
    console.log('Using fallback camera data');
    cameras = fallbackCameras as Camera[];
  }

  return NextResponse.json(cameras, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      'X-RateLimit-Remaining': String(remaining),
    },
  });
}
