'use client'

import { useState } from 'react'
import { uploadResource } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, Upload, Search, Tag } from 'lucide-react'
import { Resource } from '@/types/database'

// Mock Data for initial view (since DB is empty)
const mockResources: Resource[] = [
    { id: '1', title: 'Calculus I Notes - Cheat Sheet', description: 'Quick formula reference for derivatives and integrals.', file_url: '#', tags: ['Math', 'Year1'], uploader_id: 'u1', created_at: new Date().toISOString() },
    { id: '2', title: 'Halliday Resnick Solutions - Ch 5', description: 'Step by step solutions for Force and Motion.', file_url: '#', tags: ['Physics', 'Textbook'], uploader_id: 'u2', created_at: new Date().toISOString() },
]

export default function ResourcesPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [uploadOpen, setUploadOpen] = useState(false)
    const [resources, setResources] = useState<Resource[]>(mockResources) // In real app, this comes from props/server fetch

    // Client-side filtering for interactivity
    const filteredResources = resources.filter(res =>
        res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    async function handleUpload(formData: FormData) {
        // Wrap server action to handle UI state
        // In a real app we'd toast/notify
        const result = await uploadResource(formData)
        if (result?.success) {
            setUploadOpen(false)
            alert('Upload successful! (This is a simplified feedback)')
        } else if (result?.error) {
            alert(result.error)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Student Resources</h1>
                    <p className="text-muted-foreground">Share and find study materials.</p>
                </div>

                <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Resource
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload Material</DialogTitle>
                            <DialogDescription>
                                Share notes, past years, or helpful guides.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleUpload} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input name="title" required placeholder="e.g. Thermodynamics Summary" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input name="description" placeholder="Brief details..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tags (comma separated)</label>
                                <Input name="tags" placeholder="Year1, Notes, Exam" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">File</label>
                                <Input name="file" type="file" required />
                            </div>
                            <Button type="submit" className="w-full">Upload</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by title or tag..."
                    className="pl-10 h-10 w-full md:w-[400px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((res) => (
                    <Card key={res.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg leading-tight">{res.title}</CardTitle>
                            <CardDescription className="line-clamp-2 mt-1">
                                {res.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex flex-wrap gap-2">
                                {res.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                        <Tag className="mr-1 h-3 w-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/20 p-4">
                            <Button variant="outline" size="sm" className="w-full" asChild>
                                <a href={res.file_url} target="_blank" rel="noopener noreferrer">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            {filteredResources.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No resources found matching "{searchTerm}".
                </div>
            )}
        </div>
    )
}
