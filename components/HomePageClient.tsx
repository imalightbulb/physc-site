'use client'

import { LoginDialog } from "@/components/auth/LoginDialog"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"

export function HomePageClient({ user }: { user: any }) {
    const [showLogin, setShowLogin] = useState(false)
    const [hasChecked, setHasChecked] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        // If no user initially, show dialog
        // But also check client side to be sure (in case of stale props)
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                // Delay slightly for UX
                setTimeout(() => setShowLogin(true), 1500)
            }
            setHasChecked(true)
        }

        if (!user) {
            checkAuth()
        }
    }, [user, supabase])

    return (
        <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
    )
}
