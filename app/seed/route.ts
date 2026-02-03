import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    const categories = [
        { name: 'General Discussion', slug: 'general', description: 'Talk about anything physics related.' },
        { name: 'Homework Help', slug: 'homework', description: 'Get help with your problem sets.' },
        { name: 'Exams & Study', slug: 'exams', description: 'Prepare for upcoming midterms and finals.' },
        { name: 'Research & Careers', slug: 'research', description: 'Discuss effective field theories or effective job markets.' },
        { name: 'Chit-Chat', slug: 'chit-chat', description: 'Off-topic banter.' },
    ]

    const results = []

    for (const cat of categories) {
        const { data, error } = await supabase
            .from('categories')
            .upsert(cat, { onConflict: 'slug' })
            .select()

        results.push({ cat: cat.slug, status: error ? 'error' : 'ok', error })
    }

    return NextResponse.json({ results })
}
