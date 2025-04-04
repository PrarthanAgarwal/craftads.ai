import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Pinterest URL is required' },
        { status: 400 }
      );
    }
    
    if (!url.includes('pinterest.com')) {
      return NextResponse.json(
        { success: false, error: 'Invalid Pinterest URL' },
        { status: 400 }
      );
    }

    // Pinterest doesn't allow direct scraping due to their robots.txt and terms of service
    // Here's a simple approach that might work for some URLs, but has limitations
    try {
      // Try to fetch the Pinterest page
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Pinterest URL: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Look for the image URL in the page content
      // This is a simplified approach - Pinterest's page structure may change
      let imageUrl = null;
      
      // Look for og:image meta tag
      const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
      if (ogImageMatch && ogImageMatch[1]) {
        imageUrl = ogImageMatch[1];
      }
      
      // If no og:image, try to find other image patterns (this is simplified)
      if (!imageUrl) {
        const imageMatch = html.match(/https:\/\/i\.pinimg\.com\/originals\/[^"]+\.jpg/);
        if (imageMatch) {
          imageUrl = imageMatch[0];
        }
      }
      
      if (!imageUrl) {
        return NextResponse.json(
          { success: false, error: 'Could not extract image from Pinterest URL' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: {
          imageUrl
        }
      });
      
    } catch (error) {
      console.error('Error extracting Pinterest image:', error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to extract image from Pinterest URL',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in Pinterest extract API:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 