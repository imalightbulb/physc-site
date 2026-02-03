import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Markdown } from '@/components/Markdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NewsItem } from '@/types/database'

import { HomePageClient } from '@/components/HomePageClient'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch news
  const { data: news, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })

  const newsItems = (news as NewsItem[]) || []

  return (
    <div className="space-y-8">
      <HomePageClient user={user} />
      <section className="text-center py-12 md:py-24 lg:py-32 bg-zinc-50 dark:bg-zinc-900 rounded-3xl">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-500">
              Welcome Physics Students
            </h1>
            <p className="mx-auto max-w-[700px] text-zinc-500 md:text-xl dark:text-zinc-400">
              Your central hub for resources, discussions, and department updates.
            </p>
            <div className="flex gap-4 mt-6">
              <Button asChild size="lg" className="hover:scale-105 transition-transform">
                <Link href="/forum">Join the Discussion</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="hover:scale-105 transition-transform">
                <Link href="/resources">Browse Resources</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Latest News</h2>
        {newsItems.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
            No news posted yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="line-clamp-4">
                    <Markdown content={item.content} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

