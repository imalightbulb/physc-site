import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'
import { Category } from '@/types/database'

export default async function ForumHome() {
    const supabase = await createClient()

    // Fetch categories
    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

    const categoryList = (categories as Category[]) || []

    // Mock categories if empty for dev preview
    const verifiedCategories = categoryList.length > 0 ? categoryList : [
        { id: '1', name: 'General Physics', slug: 'general', description: 'General discussions about physics concepts.' },
        { id: '2', name: 'Homework Help', slug: 'homework', description: 'Stuck on a problem? Ask here.' },
        { id: '3', name: 'Quantum Mechanics', slug: 'quantum', description: 'Discussions specific to QM courses.' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Forum</h1>
                <p className="text-muted-foreground">Join the discussion in one of the subforums below.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {verifiedCategories.map((category) => (
                    <Link key={category.id} href={`/forum/${category.slug}`}>
                        <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <MessageSquare className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle>{category.name}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm">
                                    {category.description || 'No description provided.'}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
