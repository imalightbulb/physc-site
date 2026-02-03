'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
// Dynamic import or direct import if circular dependency isnt an issue.
// Using direct import since we are in a server action file.
import { notifyFollowers } from '@/app/actions/post-actions'

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

    // Fire and forget notification
    try {
        notifyFollowers(post_id, content).catch(console.error)
    } catch (e) {
        console.error("Notification error", e)
    }

    revalidatePath(`/forum/${slug}/${post_id}`)
    return { success: true }
}
