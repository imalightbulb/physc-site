"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function votePost(postId: string, value: 0 | 1 | -1) {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: "You must be logged in to vote." }
    }

    try {
        if (value === 0) {
            // Remove vote
            await supabase
                .from('votes')
                .delete()
                .match({ user_id: user.id, post_id: postId })
        } else {
            // Upsert vote (Insert or Update on conflict)
            const { error } = await supabase
                .from('votes')
                .upsert({
                    user_id: user.id,
                    post_id: postId,
                    value: value
                }, { onConflict: 'user_id, post_id' })

            if (error) throw error
        }

        revalidatePath('/forum/[slug]', 'page')
        revalidatePath(`/forum/[slug]/${postId}`, 'page')
        return { success: true }
    } catch (e) {
        console.error("Vote failed:", e)
        return { error: "Failed to submit vote." }
    }
}
