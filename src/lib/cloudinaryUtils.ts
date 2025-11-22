export interface CloudinaryImage {
  id: string;
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export async function getCloudinaryImages(folder: string): Promise<CloudinaryImage[]> {
  try {
    const response = await fetch(`/api/cloudinary?folder=${encodeURIComponent(folder)}`);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching images:', error);
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error);
    return [];
  }
}
