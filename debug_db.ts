
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://dobwscaqbimpbqmfqmwm.supabase.co"
const supabaseKey = "sb_publishable_f_6LbwrgSPXUXlzQcAWQYw_Xd_Hs-xa"

const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
    console.log("--- Categories ---")
    const { data: categories } = await supabase.from('categories').select('*')
    console.table(categories)

    console.log("\n--- Posts ---")
    const { data: posts } = await supabase.from('posts').select('id, title, category_id')
    console.table(posts)

    if (posts && posts.length > 0 && categories) {
        console.log("\n--- Verification ---")
        posts.forEach(p => {
            const cat = categories.find(c => c.id === p.category_id)
            console.log(`Post "${p.title}" (${p.id}) linked to Category: ${cat ? cat.slug : 'MISWATCH (ID: ' + p.category_id + ')'}`)
        })
    }
}

debug()
