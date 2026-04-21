import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limiting: 30 requests per minute per IP
  const ip = getClientIP(request);
  const { allowed, remaining } = checkRateLimit(`check-youtube:${ip}`, 30, 60_000);

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

  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json(
      { error: 'Missing videoId parameter' },
      { status: 400 }
    );
  }

  // Validate videoId format (YouTube IDs are 11 chars, alphanumeric + - + _)
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json(
      { error: 'Invalid videoId format' },
      { status: 400 }
    );
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    const response = await fetch(oembedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Cache for 5 minutes to avoid hitting YouTube too often
      next: { revalidate: 300 },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        isLive: true,
        title: data.title,
        author: data.author_name,
        thumbnailUrl: data.thumbnail_url,
      });
    } else {
      // Video is not available (private, deleted, or region-locked)
      return NextResponse.json({
        isLive: false,
        error: 'Video not available',
      });
    }
  } catch (error) {
    console.error('Error checking YouTube video status:', error);
    return NextResponse.json({
      isLive: false,
      error: 'Failed to check video status',
    });
  }
}
