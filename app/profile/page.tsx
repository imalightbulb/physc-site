import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { MessageSquare, Heart, Bookmark } from 'lucide-react'
import { Post } from '@/types/database'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user's posts
    const { data: myPosts } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

    // Fetch liked posts (where vote = 1)
    const { data: likedVotes } = await supabase
        .from('votes')
        .select('post_id, posts(*)')
        .eq('user_id', user.id)
        .eq('value', 1)

    // Extract posts from liked votes
    const likedPosts = likedVotes?.map((v: any) => v.posts).filter(Boolean) || []

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8">
            <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary border-4 border-background shadow-xl">
                    {user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{user.email?.split('@')[0]}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </div>

            <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="posts">My Posts</TabsTrigger>
                    <TabsTrigger value="liked">Liked</TabsTrigger>
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

                <TabsContent value="settings" className="mt-6 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Settings features coming soon (Email preferences, Theme toggle).
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function PostItem({ post }: { post: Post }) {
    return (
        <Link href={`/forum/post/${post.id}`}>
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
