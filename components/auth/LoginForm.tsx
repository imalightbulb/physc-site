'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login } from '@/app/login/actions'

export function LoginForm({ className }: { className?: string }) {
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        setError(null)
        setMessage(null)

        const result = await login(formData)

        if (result?.error) {
            setError(result.error)
        } else if (result?.success) {
            setMessage('Uncheck your spam! A login code/link has been sent to your school email.')
        }
        setLoading(false)
    }

    return (
        <form action={handleSubmit} className={className}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        School Email
                    </label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="PHYXXXXXXX@xmu.edu.my"
                        className="mt-1"
                        pattern="^PHY\d{7}@xmu\.edu\.my$"
                        title="Format: PHY followed by 7 digits ending with @xmu.edu.my"
                    />
                </div>
            </div>

            {error && <p className="text-sm text-red-500 font-medium mt-2">{error}</p>}
            {message && <p className="text-sm text-green-500 font-medium mt-2">{message}</p>}

            <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? 'Sending code...' : 'Send Login Code'}
            </Button>
        </form>
    )
}
