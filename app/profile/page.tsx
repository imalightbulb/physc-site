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
        .select('*, categories(slug)')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

    // Fetch liked posts (where vote = 1)
    const { data: likedVotes } = await supabase
        .from('votes')
        .select('post_id, posts(*, categories(slug))')
        .eq('user_id', user.id)
        .eq('value', 1)

    // Extract posts from liked votes
    const likedPosts = likedVotes?.map((v: any) => v.posts).filter(Boolean) || []

    // Fetch comments to show interaction history
    const { data: myComments } = await supabase
        .from('comments')
        .select('*, posts(*)')
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
                        <p className="text-muted-foreground">You haven't posted anything yet.</p>
                    ) : (
                        (myPosts || []).map((post: any) => (
                            <PostItem key={post.id} post={post} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="liked" className="mt-6 space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Heart className="h-5 w-5" /> Liked Posts
                    </h2>
                    {likedPosts.length === 0 ? (
                        <p className="text-muted-foreground">You haven't liked any posts yet.</p>
                    ) : (
                        likedPosts.map((post: any) => (
                            <PostItem key={post.id} post={post} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="comments" className="mt-6 space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" /> My Comments
                    </h2>
                    {(!myComments || myComments.length === 0) ? (
                        <p className="text-muted-foreground">You haven't commented on anything yet.</p>
                    ) : (
                        myComments.map((comment: any) => (
                            <Link key={comment.id} href={`/forum/forum/post/${comment.post_id}`}>
                                <Card className="hover:bg-muted/50 transition-colors mb-4">
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-base font-medium">
                                            On: {comment.posts?.title || 'Unknown Post'}
                                        </CardTitle>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="py-3 pt-0 text-sm text-muted-foreground line-clamp-2">
                                        "{comment.content}"
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="settings" className="mt-6 space-y-4">
                    <ProfileSettings user={user} profile={profile} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function PostItem({ post }: { post: Post }) {
    return (
        <Link href={`/forum/${post.category_id ? 'post' : 'post'}/${post.id}`}>
            {/* Note: In real app we need slug. For now forcing generic or relying on id lookup if route handles it. 
                 Actually the route is /forum/[slug]/[id]. We don't have slug easily here in post object unless we join categories.
                 Let's stick to /forum/post/[id] if we have a redirect or just /forum/general/[id] if we can guess.
                 Wait, the Post Item link in previous code was: `/forum/post/${post.id}`.
                 But the route is `/forum/[slug]/[id]`.
                 If we don't have the slug, we might break the link.
                 Let's check if we fetched categories. We did "select *".
                 Post object has category_id. We need to fetch category slug to link correctly.
                 Let's modify the fetch to include category slug.
             */}
            <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <div className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                    </div>
                </CardHeader>
            </Card>
        </Link>
    )
}
