import { createClient } from '@/utils/supabase/server'
import { NavbarContent } from './NavbarContent'

export async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return <NavbarContent user={user} />
}
