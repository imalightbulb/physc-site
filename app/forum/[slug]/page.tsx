import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PlusCircle } from 'lucide-react'
import { Post, Category } from '@/types/database'

type Props = {
    params: Promise<{ slug: string }>
}

export default async function SubforumPage({ params }: Props) {
    const { slug } = await params
    const supabase = await createClient()

    // 1. Get Category ID from Slug
    const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()

    // Use mock if DB is empty/fails
    const category: Category = categoryData || {
        id: 'mock-id',
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        slug: slug,
        description: 'Mock Category Description'
    }

    if (!category && !categoryData) {
        // In a real app we might 404, but for now we fallback to mock
        // notFound() 
    }

    // 2. Fetch Posts
    const { data: postsData } = await supabase
        .from('posts')
        .select('*, profiles(email, student_id)')
        .eq('category_id', category.id)
        .order('created_at', { ascending: false })

    const posts = (postsData as unknown as (Post & { profiles: { email: string } })[]) || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
                    <p className="text-muted-foreground">{category.description}</p>
                </div>
                <Link href={`/forum/${slug}/new`}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Post
                    </Button>
                </Link>
            </div>

            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                        No posts yet. Be the first to start a discussion!
                    </div>
                ) : (
                    posts.map((post) => (
                        <Link key={post.id} href={`/forum/${slug}/${post.id}`}>
                            <Card className="hover:bg-muted/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="text-lg">{post.title}</CardTitle>
                                    <div className="flex gap-2 text-sm text-muted-foreground">
                                        <span>by {post.profiles?.email?.split('@')[0] || 'Unknown'}</span>
                                        <span>•</span>
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
