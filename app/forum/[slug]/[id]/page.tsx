import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { getComments } from './data'
import { Markdown } from '@/components/Markdown'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createComment } from './actions'
import { CommentForm } from './CommentForm'
import { VoteControl } from '@/components/VoteControl'
import { FollowButton } from '@/components/FollowButton'
import { User, MessageSquare } from 'lucide-react'

type Props = {
    params: Promise<{ slug: string; id: string }>
}

export default async function PostPage({ params }: Props) {
    const { slug, id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch Post with author and JOINED data (votes, tags)
    // Note: getPost helper in data.ts might need refactor, but let's just do it inline or keep using it if it returns enough.
    // The previous getPost didn't return votes. Let's do a direct fetch for full control.
    const { data: post } = await supabase
        .from('posts')
        .select('*, profiles(email, student_id), votes(*), post_tags(tags(name))')
        .eq('id', id)
        .single()

    if (!post) {
        notFound()
        // return <div>Post not found</div>
    }

    const comments = await getComments(id)

    // Calculate derived state
    const votes = post.votes || []
    const score = votes.reduce((acc: any, v: any) => acc + v?.value, 0)
    const userVote = user ? votes.find((v: any) => v.user_id === user.id)?.value || 0 : 0
    const tags = post.post_tags?.map((pt: any) => pt.tags.name) || []

    // Check if following
    let isFollowing = false
    if (user) {
        const { data: follow } = await supabase
            .from('post_followers')
            .select('*')
            .match({ user_id: user.id, post_id: id })
            .single()
        isFollowing = !!follow
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex gap-4">
                {/* Vote Sidebar */}
                <div className="pt-2">
                    <VoteControl
                        postId={id}
                        initialScore={score}
                        initialUserVote={userVote as 1 | -1 | 0}
                    />
                </div>

                <div className="flex-1 space-y-4">
                    {/* Post Header */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {tags.map((tag: string) => (
                                <span key={tag} className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl text-balance">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-between mt-2 pb-4 border-b">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>{post.profiles?.email?.split('@')[0]}</span>
                                <span>•</span>
                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                            {user && <FollowButton postId={id} initialIsFollowing={isFollowing} />}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="min-h-[150px] text-lg">
                        <Markdown content={post.content} />
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-6 pt-8 border-t pl-14">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {comments.length} Comments
                </h3>

                <div className="space-y-4">
                    {comments.map((comment) => (
                        <Card key={comment.id} className="bg-muted/30">
                            <CardHeader className="py-3">
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span className="font-semibold text-foreground">
                                        {comment.profiles?.email?.split('@')[0]}
                                    </span>
                                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="py-3 pt-0">
                                <Markdown content={comment.content} className="prose-sm" />
                            </CardContent>
                        </Card>
                    ))}
                    {comments.length === 0 && (
                        <p className="text-muted-foreground italic">No comments yet.</p>
                    )}
                </div>

                {/* Comment Form */}
                <CommentForm postId={id} slug={slug} />
            </div>
        </div>
    )
}
