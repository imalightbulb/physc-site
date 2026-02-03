"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff } from "lucide-react"
import { toggleFollowPost } from "@/app/actions/post-actions"
import { cn } from "@/lib/utils"

export function FollowButton({ postId, initialIsFollowing }: { postId: string, initialIsFollowing: boolean }) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [loading, setLoading] = useState(false)

    async function handleToggle() {
        if (loading) return
        setLoading(true)
        const newState = !isFollowing
        setIsFollowing(newState) // Optimistic

        const result = await toggleFollowPost(postId, isFollowing)
        if (result?.error) {
            setIsFollowing(!newState) // Revert
        }
        setLoading(false)
    }

    return (
        <Button
            variant={isFollowing ? "secondary" : "outline"}
            size="sm"
            onClick={handleToggle}
            className={cn("gap-2 transition-all", isFollowing && "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 dark:text-yellow-400")}
        >
            {isFollowing ? <Bell className="h-4 w-4 fill-current" /> : <BellOff className="h-4 w-4" />}
            {isFollowing ? "Following" : "Follow"}
        </Button>
    )
}
