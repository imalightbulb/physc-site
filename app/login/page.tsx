import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Physics Forum</h1>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                        Sign in with your student ID
                    </p>
                </div>

                <LoginForm className="mt-8 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800" />
            </div>
        </div>
    )
}
