import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="space-y-6 text-center max-w-md">
                <div className="space-y-2">
                    <h1 className="text-8xl font-black text-primary/10 tracking-tighter">404</h1>
                    <h2 className="text-3xl font-bold tracking-tight">Page not found</h2>
                    <p className="text-muted-foreground">
                        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-4">
                    <Button asChild variant="default" size="lg">
                        <Link href="/dashboard">
                            <MoveLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/">
                            Go Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
