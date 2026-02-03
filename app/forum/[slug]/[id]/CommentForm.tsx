'use client'

import { useState } from 'react'
import { createComment } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export function CommentForm({ postId, slug }: { postId: string, slug: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        // We append the hidden fields manually or let the formData capture them if they were inputs.
        // But since we are calling the bound action or wrapper, let's just make sure the action gets what it needs.
        // The action expects formData with 'content', 'post_id', 'slug'.
        // We can inject them or put hidden inputs. Hidden inputs are easier with formData.

        const result = await createComment(formData)

        if (result?.error) {
            alert(result.error)
        } else {
            // Success
            // field reset
            const form = document.querySelector('form[action="javascript:void(0);"]') as HTMLFormElement
            if (form) form.reset() // tough to target specific form ref here without ref
        }
        setLoading(false)
    }

    return (
        <form action={handleSubmit} className="flex gap-2 items-start mt-6">
            <input type="hidden" name="post_id" value={postId} />
            <input type="hidden" name="slug" value={slug} />
            <div className="flex-1">
                <Input
                    name="content"
                    placeholder="Write a comment... (Supports Markdown/LaTeX)"
                    className="flex-1"
                    required
                />
                <p className="text-xs text-muted-foreground mt-1 ml-1">
                    Supports Markdown and LaTeX ($...$)
                </p>
            </div>
            <Button type="submit" disabled={loading}>
                {loading ? 'Posting...' : 'Post'}
            </Button>
        </form>
    )
}
