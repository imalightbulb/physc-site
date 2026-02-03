import { notFound } from 'next/navigation'
import { getPost, getComments } from './data'
import { Markdown } from '@/components/Markdown'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createComment } from './actions'
import { CommentForm } from './CommentForm'
import { User, MessageSquare } from 'lucide-react'

type Props = {
    params: Promise<{ slug: string; id: string }>
}

export default async function PostPage({ params }: Props) {
    const { slug, id } = await params

    const post = await getPost(id)

    if (!post) {
        // In prod: notFound()
        // For dev/mock:
        // return <div>Post not found (Mock data missing)</div>
    }

    const comments = await getComments(id)

    const mockPostRaw = {
        id: id,
        title: 'How do I solve the infinite square well?',
        content: 'I am stuck on the boundary conditions. specifically $\\psi(0) = 0$ and $\\psi(L) = 0$. \n\nHere is my attempt:\n$$ \\psi(x) = A \\sin(kx) + B \\cos(kx) $$',
        created_at: new Date().toISOString(),
        profiles: { email: 'PHY2222222@xmu.edu.my' }
    }

    // Fallback to mock if fetch failed (expected without DB)
    const displayPost = post || mockPostRaw

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Post Content */}
            <div className="space-y-4">
                <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl text-balance">
                    {displayPost.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pb-4 border-b">
                    <User className="h-4 w-4" />
                    <span>{displayPost.profiles?.email?.split('@')[0]}</span>
                    <span>•</span>
                    <span>{new Date(displayPost.created_at).toLocaleDateString()}</span>
                </div>

                <div className="min-h-[200px] text-lg">
                    <Markdown content={displayPost.content} />
                </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-6 pt-8 border-t">
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
