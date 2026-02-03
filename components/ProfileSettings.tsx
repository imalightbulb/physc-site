'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { updateProfile } from '@/app/profile/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProfileSettingsProps {
    user: any
    profile: any
}

export function ProfileSettings({ user, profile }: ProfileSettingsProps) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const handleUpdate = async (formData: FormData) => {
        setLoading(true)
        setMessage(null)

        const result = await updateProfile(formData)

        if (result?.success) {
            setMessage("Profile updated successfully!")
        }
        setLoading(false)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="full_name" className="text-sm font-medium">Full Name</label>
                        <Input
                            id="full_name"
                            name="full_name"
                            defaultValue={profile?.full_name || ''}
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="student_id" className="text-sm font-medium">Student ID</label>
                        <Input
                            id="student_id"
                            value={profile?.student_id || ''}
                            disabled
                            className="bg-muted"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="bio" className="text-sm font-medium">Bio (Optional)</label>
                        <Textarea
                            id="bio"
                            name="bio"
                            placeholder="Tell us a bit about yourself..."
                        />
                        {/* Note: Schema might not have bio yet, checking needed */}
                    </div>

                    {message && <p className="text-green-500 text-sm">{message}</p>}

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
