'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { LoginForm } from "@/components/auth/LoginForm"

interface LoginDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Sign in to continue</DialogTitle>
                    <DialogDescription>
                        Join the forum to post, vote, and see your profile.
                    </DialogDescription>
                </DialogHeader>
                <LoginForm />
            </DialogContent>
        </Dialog>
    )
}
