'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Book, MessageSquare, Newspaper, LogIn } from 'lucide-react'

export function Navbar() {
    const pathname = usePathname()

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
                                    "transition-colors hover:text-foreground/80 flex items-center gap-2",
                                    pathname === link.href ? "text-foreground" : "text-foreground/60"
                                )}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Mobile Menu Placeholder (simplified for now) */}
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search could go here */}
                    </div>
                    <Link href="/login">
                        <Button variant="ghost" size="icon">
                            <LogIn className="h-4 w-4" />
                            <span className="sr-only">Login</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
