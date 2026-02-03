'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function uploadResource(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const tagsString = formData.get('tags') as string
    const file = formData.get('file') as File

    if (!file || file.size === 0) {
        return { error: 'No file selected.' }
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'You must be logged in to upload resources.' }
    }

    // 1. Upload File to Storage Bucket
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file)

    if (uploadError) {
        return { error: `Upload failed: ${uploadError.message}` }
    }

    // 2. Insert Metadata into DB
    const tags = tagsString.split(',').map(t => t.trim()).filter(t => t.length > 0)

    // Construct Public URL (assuming public bucket)
    const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(filePath)

    const { error: dbError } = await supabase
        .from('resources')
        .insert({
            title,
            description,
            file_url: publicUrl,
            tags,
            uploader_id: user.id
        })

    if (dbError) {
        return { error: `Database error: ${dbError.message}` }
    }

    revalidatePath('/resources')
    return { success: true }
}
