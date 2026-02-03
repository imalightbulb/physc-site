import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PlusCircle, MessageSquare, Share2 } from 'lucide-react'
import { Post, Category, Vote } from '@/types/database'
import { VoteControl } from '@/components/VoteControl'
import { Markdown } from '@/components/Markdown'

type Props = {
    params: Promise<{ slug: string }>
}

export default async function SubforumPage({ params }: Props) {
    const { slug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

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
        // Handle 404
    }

    // 2. Fetch Posts with Votes, Profiles, and Tags
    // We fetch all votes -> simplistic approach for MVP. For scale, use RPC or View.
    const { data: postsData } = await supabase
        .from('posts')
        .select('*, profiles(email, student_id), votes(*), comments(count), post_tags(tags(name))')
        .eq('category_id', category.id)
        .order('created_at', { ascending: false })

    // Process posts to calculate score and user vote
    const posts = ((postsData as unknown as (Post & {
        profiles: { email: string },
        votes: Vote[],
        post_tags: { tags: { name: string } }[], // Joined tags
        comments: { count: number }[]
        // Actually Supabase select count is usually returned in `count` property if requested, but here we requested relation.
        // Let's assume votes is array of objects.
    })[]) || []).map(post => {
        const votes = post.votes || []
        const score = votes.reduce((acc, v) => acc + v.value, 0)
        const userVote = user ? votes.find(v => v.user_id === user.id)?.value || 0 : 0
        const tags = post.post_tags?.map(pt => pt.tags.name) || []
        // Fix for comment count check
        // Often supabase returns `comments: [{count: 5}]` if used with aggregate, but simpler to just use length of ids if we fetched them, 
        // OR better: use `.select(*, comments(count))` which returns `comments: [{count: N}]` is NOT standard without groupby.
        // Standard: `.select(*, comments(*))` sends all data.
        // Optimized: `.select(*, comments(id))` and count length.
        // Let's just use what we have:
        // Supabase select with count is tricky in one go without causing huge payload. 
        // Let's assume for MVP we might not get exact count unless we load them.
        // Let's safe guard:
        const commentCount = post.comments && Array.isArray(post.comments) ? post.comments[0]?.count ?? 0 : 0;

        return {
            ...post,
            score,
            userVote,
            tags,
            commentCount
        }
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card border rounded-xl shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">f/{slug}</h1>
                    <p className="text-muted-foreground text-sm md:text-base">{category.description}</p>
                </div>
                <Link href={`/forum/${slug}/new`}>
                    <Button className="w-full md:w-auto shadow-md hover:scale-105 transition-all">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Post
                    </Button>
                </Link>
            </div>

            {/* Post List */}
            <div className="space-y-2">
                {posts.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground bg-muted/20">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                            <MessageSquare className="h-6 w-6 opacity-50" />
                        </div>
                        <h3 className="text-lg font-semibold">No posts yet</h3>
                        <p className="text-sm">Be the first to start a conversation in f/{slug}!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <Card key={post.id} className="hover:border-primary/50 transition-colors duration-200 overflow-hidden group">
                            <div className="flex">
                                {/* Vote Column */}
                                <div className="dark:bg-muted/10 bg-muted/30 border-r w-12 sm:w-16 flex-none flex pt-2 justify-center">
                                    <VoteControl
                                        postId={post.id}
                                        initialScore={post.score}
                                        initialUserVote={post.userVote as 1 | -1 | 0}
                                    />
                                </div>

                                {/* Content Column */}
                                <Link
                                    href={`/forum/${slug}/${post.id}`}
                                    className="flex-1 min-w-0 p-4 pt-3 flex flex-col gap-2 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">f/{slug}</span>
                                        <span>•</span>
                                        <span>Posted by {post.profiles?.email?.split('@')[0] || 'u/unknown'}</span>
                                        <span>•</span>
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <h3 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h3>

                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="text-sm text-muted-foreground line-clamp-3">
                                        {/* Render a snippet or just text */}
                                        <Markdown content={post.content.slice(0, 300) + (post.content.length > 300 ? '...' : '')} />
                                    </div>

                                    <div className="mt-2 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                        <div className="flex items-center gap-1 hover:bg-muted p-1.5 rounded-sm transition-colors">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>{post.commentCount || 0} Comments</span>
                                        </div>
                                        <div className="flex items-center gap-1 hover:bg-muted p-1.5 rounded-sm transition-colors">
                                            <Share2 className="h-4 w-4" />
                                            <span>Share</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
