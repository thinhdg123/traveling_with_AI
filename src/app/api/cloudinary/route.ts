import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Types for Cloudinary Response
interface CloudinaryResource {
  asset_id: string;
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
}

interface CloudinaryResponse {
  resources: CloudinaryResource[];
  next_cursor?: string; // Important for pagination
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get('folder');
  const cursor = searchParams.get('cursor'); // Add support for loading more

  if (!folder) {
    return NextResponse.json(
      { error: 'Folder parameter is required' }, 
      { status: 400 }
    );
  }

  try {
    // Using the Search API is often more flexible for public galleries
    // But sticking to your Admin API approach for simplicity (keep rate limits in mind):
    
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: `${folder}/`, // specific folder
      max_results: 30,
      next_cursor: cursor || undefined, // Pass cursor if it exists
    }) as CloudinaryResponse;

    const images = result.resources.map((resource) => ({
      id: resource.asset_id,
      url: resource.secure_url,
      publicId: resource.public_id,
      width: resource.width,
      height: resource.height,
      format: resource.format,
    }));

    return NextResponse.json({
      images,
      nextCursor: result.next_cursor || null, // Send this back to frontend
    });

  } catch (error) {
    console.error('Error fetching from Cloudinary:', error);
    
    // Check specifically for 404 (Not Found) from Cloudinary
    // Note: Cloudinary usually returns an empty list for bad folders, not an error.
    // But if it throws a specific error object:
    return NextResponse.json(
      { 
        error: 'Failed to fetch images',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}