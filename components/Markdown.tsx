import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { cn } from '@/lib/utils'

interface MarkdownProps {
    content: string
    className?: string
}

export function Markdown({ content, className }: MarkdownProps) {
    return (
        <div className={cn("prose dark:prose-invert max-w-none", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    // Add custom component mapping if needed
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
