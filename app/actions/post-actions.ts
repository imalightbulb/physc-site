"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function votePost(postId: string, value: 0 | 1 | -1) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: "You must be logged in to vote." }
    }

    try {
        if (value === 0) {
            await supabase.from('votes').delete().match({ user_id: user.id, post_id: postId })
        } else {
            const { error } = await supabase.from('votes').upsert({
                user_id: user.id,
                post_id: postId,
                value: value
            }, { onConflict: 'user_id, post_id' })
            if (error) throw error
        }
        revalidatePath('/forum', 'layout') // Revalidate all forum pages
        return { success: true }
    } catch (e) {
        console.error("Vote failed:", e)
        return { error: "Failed to submit vote." }
    }
}

export async function toggleFollowPost(postId: string, currentState: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Login required" }

    try {
        if (currentState) {
            // Unfollow
            await supabase.from('post_followers').delete().match({ user_id: user.id, post_id: postId })
        } else {
            // Follow
            await supabase.from('post_followers').insert({ user_id: user.id, post_id: postId })
        }
        revalidatePath(`/forum`)
        return { success: true }
    } catch (e) {
        console.error("Follow failed:", e)
        return { error: "Failed to update follow status" }
    }
}

// Stub for email notification hook
export async function notifyFollowers(postId: string, commentContent: string) {
    // This would be called by createComment action
    console.log(`[MOCK EMAIL] Notifying followers of post ${postId} about new comment: ${commentContent.substring(0, 20)}...`)
    // Real implementation: Fetch followers -> SendGrid/Resend API
}
