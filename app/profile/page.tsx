import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { MessageSquare, Heart, Bookmark } from 'lucide-react'
import { Post } from '@/types/database'
import { ProfileSettings } from '@/components/ProfileSettings'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user's posts with category slug
    const { data: myPosts } = await supabase
        .from('posts')
        .select('*, categories(slug), votes(*), comments(count)')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

    // Fetch liked posts (where vote = 1)
    const { data: likedVotes } = await supabase
        .from('votes')
        .select('post_id, posts(*, categories(slug), votes(*), comments(count))')
        .eq('user_id', user.id)
        .eq('value', 1)

    // Extract posts from liked votes
    const likedPosts = likedVotes?.map((v: any) => v.posts).filter(Boolean) || []

    // Fetch comments to show interaction history
    const { data: myComments } = await supabase
        .from('comments')
        .select('*, posts(*, categories(slug))')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8">
            <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary border-4 border-background shadow-xl">
                    {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{profile?.full_name || user.email?.split('@')[0]}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    {profile?.student_id && <p className="text-xs text-muted-foreground">ID: {profile.student_id}</p>}
                </div>
            </div>

            <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="posts">My Posts</TabsTrigger>
                    <TabsTrigger value="liked">Liked</TabsTrigger>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="mt-6 space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" /> My Discussions
                    </h2>
                    {(myPosts || []).length === 0 ? (
                        <p className="text-muted-foreground italic">You haven't posted anything yet.</p>
                    ) : (
                        (myPosts || []).map((post: any) => (
                            <PostItem key={post.id} post={post} user={user} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="liked" className="mt-6 space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Heart className="h-5 w-5" /> Liked Posts
                    </h2>
                    {likedPosts.length === 0 ? (
                        <p className="text-muted-foreground italic">You haven't liked any posts yet.</p>
                    ) : (
                        likedPosts.map((post: any) => (
                            <PostItem key={post.id} post={post} user={user} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="comments" className="mt-6 space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" /> My Comments
                    </h2>
                    {(!myComments || myComments.length === 0) ? (
                        <p className="text-muted-foreground italic">You haven't commented on anything yet.</p>
                    ) : (
                        myComments.map((comment: any) => {
                            const categorySlug = comment.posts?.categories?.slug || 'general'
                            return (
                                <Link key={comment.id} href={`/forum/${categorySlug}/${comment.post_id}`}>
                                    <Card className="hover:bg-muted/40 transition-all duration-200 border-l-4 border-l-primary/50 hover:border-l-primary group">
                                        <CardHeader className="py-3 px-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                                        Commented on <span className="text-foreground font-semibold group-hover:underline">{comment.posts?.title || 'Unknown Post'}</span>
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                        <span className="bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground font-medium">f/{categorySlug}</span>
                                                        <span>•</span>
                                                        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="py-3 pt-0 px-4">
                                            <div className="relative pl-4 border-l-2 border-muted">
                                                <p className="text-sm italic text-foreground/80 line-clamp-2">"{comment.content}"</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            )
                        })
                    )}
                </TabsContent>

                <TabsContent value="settings" className="mt-6 space-y-4">
                    <ProfileSettings user={user} profile={profile} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function PostItem({ post, user }: { post: any, user: any }) {
    // Calculate basic stats if available
    const votes = post.votes || []
    const score = votes.reduce((acc: any, v: any) => acc + v.value, 0)
    const commentCount = post.comments && post.comments[0] ? post.comments[0].count : (post.comments?.length || 0)
    const categorySlug = post.categories?.slug || 'general'

    return (
        <Link href={`/forum/${categorySlug}/${post.id}`}>
            <Card className="hover:border-primary/50 transition-all duration-200 group overflow-hidden">
                <div className="flex">
                    {/* Mini Vote/Score Indicator */}
                    <div className="w-12 bg-muted/20 flex flex-col items-center justify-center border-r text-sm font-medium text-muted-foreground">
                        <div className="font-bold text-foreground">{score}</div>
                        <div className="text-[10px] uppercase">Votes</div>
                    </div>

                    <div className="flex-1 p-4 py-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <span className="font-bold text-foreground/80">f/{categorySlug}</span>
                            <span>•</span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors mb-2">
                            {post.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{commentCount} Comments</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
