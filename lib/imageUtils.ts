// lib/imageUtils.ts
import { supabase } from './supabase';

export const getSignedImageUrl = async (filePath: string): Promise<string | null> => {
  try {
    if (!filePath) return null;
    
    // If it's already a full URL, return it
    if (filePath.startsWith('https://')) {
      return filePath;
    }
    
    console.log('🔍 Getting signed URL for:', filePath);
    
    const { data, error } = await supabase.storage
      .from('conceptapp-imageuploads')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    console.log('✅ Signed URL created successfully');
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
};

export const getPublicImageUrl = (filePath: string): string | null => {
  try {
    if (!filePath) return null;
    
    // If it's already a full URL, return it
    if (filePath.startsWith('https://')) {
      return filePath;
    }
    
    const { data } = supabase.storage
      .from('conceptapp-imageuploads')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error getting public URL:', error);
    return null;
  }
};