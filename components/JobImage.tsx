// components/JobImage.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSignedImageUrl } from '../lib/imageUtils';

interface JobImageProps {
  imagePath: string | null;
  alt: string;
  className?: string;
}

export default function JobImage({ imagePath, alt, className }: JobImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!imagePath) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        
        const url = await getSignedImageUrl(imagePath);
        setImageUrl(url);
      } catch (err) {
        console.error('Error loading image:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [imagePath]);

  if (!imagePath) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-500">No image uploaded</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading image...</p>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center ${className}`}>
        <p className="text-red-500">Failed to load image</p>
        <p className="text-sm text-gray-500 mt-1">Path: {imagePath}</p>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`rounded-lg object-cover ${className}`}
      onError={() => setError(true)}
    />
  );
}