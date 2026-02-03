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

export type Post = {
    id: string
    title: string
    content: string
    category_id: string
    author_id: string
    created_at: string
    updated_at: string
    category?: Category
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
