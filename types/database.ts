export type Profile = {
    id: string
    email: string
    student_id: string
    role: 'student' | 'admin'
    created_at: string
}

export type NewsItem = {
    id: string
    title: string
    content: string
    created_at: string
    author_id: string
}

export type Category = {
    id: string
    name: string
    slug: string
    description?: string
}

export type Tag = {
    id: string
    name: string
}

export type Vote = {
    id: string
    user_id: string
    post_id: string
    value: 1 | -1
    created_at: string
}

export type Post = {
    id: string
    title: string
    content: string
    category_id: string
    author_id: string
    created_at: string
    updated_at: string
    category?: Category
    profiles?: Profile // Author
    // Joined fields
    votes?: Vote[]
    post_tags?: { tags: Tag }[] // Supabase join structure often looks like this
    _count?: {
        comments: number
        votes: number // or logic to sum
    }
}

export type Comment = {
    id: string
    content: string
    post_id: string
    author_id: string
    created_at: string
    profiles?: Profile
}

export type Resource = {
    id: string
    title: string
    description?: string
    file_url: string
    tags: string[]
    uploader_id: string
    created_at: string
}
