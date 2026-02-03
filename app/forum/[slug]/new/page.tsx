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
        // Since we are client-side, we can just append, but here we already have inputs with names.
        // We'll call the server action.
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

                <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <Tabs defaultValue="write" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 max-w-[200px] mb-2">
                            <TabsTrigger value="write">Write</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>
                        <TabsContent value="write">
                            <Textarea
                                name="content"
                                required
                                placeholder="Write your post here... Markdown and LaTeX supported."
                                className="min-h-[300px] font-mono"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </TabsContent>
                        <TabsContent value="preview">
                            <Card className="min-h-[300px]">
                                <CardContent className="pt-6">
                                    {content ? (
                                        <Markdown content={content} />
                                    ) : (
                                        <span className="text-muted-foreground italic">Nothing to preview</span>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                    <p className="text-xs text-muted-foreground">
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
