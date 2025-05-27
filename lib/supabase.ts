import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get signed URL for private bucket images
export const getSignedImageUrl = async (imagePath: string | null | undefined): Promise<string | null> => {
  if (!imagePath) return null
  
  // If it's a Supabase public URL, extract the file path and create signed URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // Extract the file path from the public URL
    const publicUrlPattern = /\/storage\/v1\/object\/public\/conceptapp-imageuploads\/(.+)$/
    const match = imagePath.match(publicUrlPattern)
    
    if (match) {
      const filePath = match[1] // This gets everything after 'conceptapp-imageuploads/'
      console.log('🔄 Converting public URL to signed URL for:', filePath)
      
      try {
        // Create signed URL for the extracted path
        const { data, error } = await supabase.storage
          .from('conceptapp-imageuploads')
          .createSignedUrl(filePath, 3600) // 1 hour expiry
        
        if (error) {
          console.error('❌ Error creating signed URL:', error)
          return null
        }
        
        console.log('✅ Signed URL created:', data.signedUrl)
        return data.signedUrl
      } catch (error) {
        console.error('❌ Error generating signed URL:', error)
        return null
      }
    }
    
    // If it's not a recognized Supabase URL, return null
    console.error('❌ Unrecognized URL format:', imagePath)
    return null
  }
  
  // If it starts with /, it's already a proper path - return as is for now
  if (imagePath.startsWith('/')) {
    return imagePath
  }
  
  try {
    console.log('🔐 Creating signed URL for file path:', imagePath)
    
    // For file paths, create a signed URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('conceptapp-imageuploads')
      .createSignedUrl(imagePath, 3600) // 1 hour expiry
    
    if (error) {
      console.error('❌ Error creating signed URL:', error)
      return null
    }
    
    console.log('✅ Signed URL created:', data.signedUrl)
    return data.signedUrl
  } catch (error) {
    console.error('❌ Error generating image URL:', error)
    return null
  }
}

// Keep the old function name for compatibility but make it async
export const getImageUrl = getSignedImageUrl

// Database types (using snake_case to match PostgreSQL conventions)
export interface Job {
  id: string
  title: string
  description: string
  company: string
  status: 'open' | 'accepted' | 'onsite' | 'completed'
  accepted_by: string | null
  accepted_at: string | null
  onsite_time: string | null
  completed_time: string | null
  invoiced: boolean
  created_at: string
  updated_at?: string
  work_started_image?: string
  work_started_notes?: string
  work_completed_image?: string
  work_completed_notes?: string
}