'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string

    // Regex Validation for XMU Physics Students
    // PHY followed by 7 digits @xmu.edu.my
    const emailRegex = /^PHY\d{7}@xmu\.edu\.my$/i

    if (!emailRegex.test(email)) {
        return { error: 'Invalid email format. Must be PHYXXXXXXX@xmu.edu.my' }
    }

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true, // Allow new users to sign up via this flow? Assuming logic: yes.
            // emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`, // TODO: Needs callback route
        }
    })

    if (error) {
        return { error: error.message }
    }

    // Redirect to a verification page or show success state
    // For simplicity with basic OTP, usually we just tell them to check email
    // If using Magic Link, it's same.
    // We'll return success to the client to update UI
    return { success: true }
}
