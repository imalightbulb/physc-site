'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createPost(formData: FormData) {
    const supabase = await createClient()

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const slug = formData.get('slug') as string

    // Get Category ID from Slug
    const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .single()

    if (!category) {
        // Handle error - category not found
        return { error: 'Category not found' }
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'You must be logged in to post.' }
    }

    const { data, error } = await supabase
        .from('posts')
        .insert({
            title,
            content,
            category_id: category.id,
            author_id: user.id
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    redirect(`/forum/${slug}/${data.id}`)
}
