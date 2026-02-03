'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Book, MessageSquare, Newspaper, LogIn, User } from 'lucide-react'
import { ModeToggle } from './ModeToggle'

import { createClient } from '@/utils/supabase/client' // Need client helper
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
    user: any // Initial user state from server
}

export function NavbarContent({ user: initialUser }: Props) {
    const pathname = usePathname()
    const [user, setUser] = useState(initialUser)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser(session.user)
            } else {
                setUser(null)
            }
            // Optional: refresh server components if needed
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                router.refresh()
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase, router])

    const links = [
        { href: '/', label: 'News', icon: Newspaper },
        { href: '/forum', label: 'Forum', icon: MessageSquare },
        { href: '/resources', label: 'Resources', icon: Book },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-4 max-w-screen-xl mx-auto">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-bold sm:inline-block">Physics Forum</span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "relative px-3 py-2 rounded-md transition-all duration-200 group flex items-center gap-2",
                                    pathname === link.href
                                        ? "text-primary bg-primary/10 font-semibold"
                                        : "text-muted-foreground hover:text-primary hover:bg-muted"
                                )}
                            >
                                <link.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", pathname === link.href && "text-primary")} />
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Mobile Menu Placeholder */}
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search could go here */}
                    </div>
                    <div className="flex items-center gap-2">
                        <ModeToggle />
                        {user ? (
                            <Link href="/profile">
                                <Button variant="ghost" size="icon" title="My Profile">
                                    <User className="h-4 w-4" />
                                    <span className="sr-only">Profile</span>
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Login
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
