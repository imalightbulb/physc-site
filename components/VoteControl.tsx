"use client"

import { useState } from "react"
import { ArrowBigUp, ArrowBigDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// We will pass server actions or handlers for voting
import { votePost } from "@/app/actions/post-actions"

interface VoteControlProps {
    postId: string
    initialScore: number
    initialUserVote?: 1 | -1 | 0
}

export function VoteControl({ postId, initialScore, initialUserVote = 0 }: VoteControlProps) {
    const [score, setScore] = useState(initialScore)
    const [userVote, setUserVote] = useState(initialUserVote)
    const [loading, setLoading] = useState(false)

    async function handleVote(value: 1 | -1) {
        // Prevent spamming
        if (loading) return

        // Optimistic update
        const previousVote = userVote
        const previousScore = score

        // Toggle off if same vote
        const newVote = value === userVote ? 0 : value

        // Calculate new score based on diff
        // If removing vote: subtract value (e.g. was 1, now 0 -> score - 1)
        // If changing vote: subtract old, add new (e.g. was 1, now -1 -> score - 1 - 1 = score - 2)
        // If adding vote: add new (e.g. was 0, now 1 -> score + 1)

        let scoreDiff = 0
        if (previousVote === newVote) {
            // No change (shouldn't happen with our toggle logic above)
        } else {
            scoreDiff = newVote - previousVote
        }

        setScore(score + scoreDiff)
        setUserVote(newVote)
        setLoading(true)

        try {
            const result = await votePost(postId, newVote)
            if (result?.error) {
                // Revert
                setScore(previousScore)
                setUserVote(previousVote)
                // Toast error here
                console.error(result.error)
            }
        } catch (e) {
            // Revert
            setScore(previousScore)
            setUserVote(previousVote)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-1 p-2 bg-muted/10 rounded-lg">
            <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 hover:bg-transparent hover:text-orange-500", userVote === 1 && "text-orange-500")}
                onClick={(e) => { e.preventDefault(); handleVote(1); }}
            >
                <ArrowBigUp className={cn("h-8 w-8", userVote === 1 && "fill-current")} />
            </Button>

            <span className={cn("text-sm font-bold min-w-[2ch] text-center",
                userVote === 1 && "text-orange-500",
                userVote === -1 && "text-blue-500"
            )}>
                {score}
            </span>

            <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 hover:bg-transparent hover:text-blue-500", userVote === -1 && "text-blue-500")}
                onClick={(e) => { e.preventDefault(); handleVote(-1); }}
            >
                <ArrowBigDown className={cn("h-8 w-8", userVote === -1 && "fill-current")} />
            </Button>
        </div>
    )
}
