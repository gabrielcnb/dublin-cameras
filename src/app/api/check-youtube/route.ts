import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json(
      { error: 'Missing videoId parameter' },
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
