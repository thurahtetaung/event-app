import { createClient } from '@supabase/supabase-js'
import Cookies from 'js-cookie'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mahzkacvsmhusyznsoqf.supabase.co'
const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  }
}

export async function uploadEventCoverImage(file: File) {
  try {
    // Get the auth token from cookies
    const token = Cookies.get('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    // Create a client with just the auth token
    const supabase = createClient(supabaseUrl, token, options)

    // Create a unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `event-covers/${fileName}`

    // Upload the file
    const { data, error } = await supabase.storage
      .from('public_assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('public_assets')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to upload image')
  }
}