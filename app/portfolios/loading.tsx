import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PortfoliosLoading() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-[300px]" />
                    <Skeleton className="h-4 w-[450px]" />
                </div>
            </div>

            <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center">
                <Skeleton className="h-10 flex-1 max-w-sm" />
                <Skeleton className="h-10 w-[150px]" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                    <Card key={i} className="flex flex-col h-full overflow-hidden">
                        <div className="aspect-video">
                            <Skeleton className="h-full w-full" />
                        </div>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </CardHeader>
                        <CardContent className="mt-auto flex gap-2">
                            <Skeleton className="h-9 w-20" />
                            <Skeleton className="h-9 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
