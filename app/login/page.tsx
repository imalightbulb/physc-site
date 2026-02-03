'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login } from './actions'

export default function LoginPage() {
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
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Physics Forum</h1>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                        Sign in with your student ID
                    </p>
                </div>

                <form action={handleSubmit} className="mt-8 space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
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

                    {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                    {message && <p className="text-sm text-green-500 font-medium">{message}</p>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Sending code...' : 'Send Login Code'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
