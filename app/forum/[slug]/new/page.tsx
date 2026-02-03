'use client'

import { useState } from 'react'
import { createPost } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Markdown } from '@/components/Markdown'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Props = {
    params: Promise<{ slug: string }>
}

// NOTE: Tabs components are not yet installed/created, using simple state for now to avoid dependency cycle if I forgot to install tabs primitive.
// Actually, I should use standard React state for tabs to keep it simple and dependency-free for this step.

export default function NewPostPage({ params }: Props) {
    // Unwrap params using React.use() or await in client component (not supported directly in default export without 'use client' + async wrapper, but here it's a client component receiving promise).
    // In Next.js 15 'use client' components receive params as promise. In 14 they are creating issues.
    // Safe bet: use `use` hook or just `await` if it was a server component.
    // Since this is a Client Component, params is passed as Promise in generic Next 15 types, but let's assume it resolves roughly or use `React.use` if available.
    // For simplicity in standard Next 14/15 compat: I'll accept it as prop and await it in an effect or just use it if it's not a promise in 14.
    // Let's assume params is a Promise as per Next 15 breaking change.

    // Workaround for Client Component async params:
    const [slug, setSlug] = useState<string>('')

    // We'll read the slug from the URL or passed prop.
    // Actually, let's make this a Server Component that renders a Client Form.
    // That's the cleaner pattern.
    return <NewPostFormWrapper params={params} />
}

import { use } from 'react' // React 19 / Next 15

function NewPostFormWrapper({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    return <NewPostForm slug={slug} />
}

function NewPostForm({ slug }: { slug: string }) {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        // Remove potentially duplicate 'content' entries from DOM inputs
        formData.delete('content')
        // Append the single source of truth
        formData.append('content', content)

        const result = await createPost(formData)
        if (result?.error) {
            alert(result.error)
            setLoading(false)
        }
        // If success, the server action redirects, so we don't need to do anything.
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
                <p className="text-muted-foreground capitalize">In {slug} Forum</p>
            </div>

            <form action={handleSubmit} onSubmit={() => setLoading(true)} className="space-y-6">
                <input type="hidden" name="slug" value={slug} />

                <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input name="title" required placeholder="e.g. Question about Angular Momentum" />
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-medium">Content</label>

                    {/* Desktop Side-by-Side View (hidden on mobile) */}
                    <div className="hidden lg:grid grid-cols-2 gap-6 h-[600px]">
                        <div className="flex flex-col h-full space-y-2">
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Editor</div>
                            <Textarea
                                // name="content" // Removed name attribute as content is passed via formData.set
                                required
                                placeholder="Type your post here... Support Markdown & LaTeX ($E=mc^2$)"
                                className="flex-1 font-mono resize-none p-4"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col h-full space-y-2">
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Live Preview</div>
                            <Card className="flex-1 overflow-auto bg-muted/30">
                                <CardContent className="pt-6 prose dark:prose-invert max-w-none">
                                    {content ? (
                                        <Markdown content={content} />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground italic">
                                            Preview will appear here...
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Mobile Tabs View (hidden on desktop) */}
                    <div className="lg:hidden">
                        <Tabs defaultValue="write" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="write">Write</TabsTrigger>
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                            </TabsList>
                            <TabsContent value="write">
                                <Textarea
                                    // name="content-mobile" // Removed name attribute as content is passed via formData.set
                                    placeholder="Write your post here..."
                                    className="min-h-[300px] font-mono"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </TabsContent>
                            <TabsContent value="preview">
                                <Card className="min-h-[300px]">
                                    <CardContent className="pt-6">
                                        {content ? <Markdown content={content} /> : <span className="text-muted-foreground italic">Nothing to preview</span>}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                        Use <code>$math$</code> for inline equations and <code>$$math$$</code> for block equations.
                    </p>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => window.history.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Posting...' : 'Create Post'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
