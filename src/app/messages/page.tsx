import { Navbar } from "@/components/layout/navbar";

export default function MessagesPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Messages</h1>
                <p className="text-muted-foreground">Message center coming soon...</p>
            </main>
        </div>
    );
}
