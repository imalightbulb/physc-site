import { createClient } from '@/utils/supabase/server'
import { Post, Profile } from '@/types/database'

export async function getPost(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(email, student_id)')
        .eq('id', id)
        .single()

    if (error) return null;
    return data as unknown as (Post & { profiles: Profile })
}

export async function getComments(postId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(email, student_id)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

    if (error) return []
    return data as unknown as Array<{
        id: string,
        content: string,
        created_at: string,
        profiles: Profile
    }>
}
