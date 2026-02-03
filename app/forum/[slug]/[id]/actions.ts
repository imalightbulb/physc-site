'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createComment(formData: FormData) {
    const supabase = await createClient()

    const content = formData.get('content') as string
    const post_id = formData.get('post_id') as string
    const slug = formData.get('slug') as string

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'You must be logged in to comment.' }
    }

    const { error } = await supabase
        .from('comments')
        .insert({
            content,
            post_id,
            author_id: user.id
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/forum/${slug}/${post_id}`)
    return { success: true }
}
