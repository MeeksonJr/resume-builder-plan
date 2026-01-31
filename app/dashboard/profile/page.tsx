import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    User,
    Mail,
    MapPin,
    Calendar,
    Briefcase,
    ExternalLink,
    Settings
} from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/signin");
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // Fetch user's portfolio
    const { data: portfolio } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user.id)
        .single();

    // Fetch resume count
    const { count: resumeCount } = await supabase
        .from("resumes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

    const displayName = profile?.full_name || user.user_metadata?.full_name || "User";
    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="container max-w-5xl mx-auto p-6 space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-black">Your Profile</h1>
                    <p className="text-muted-foreground">Manage your account information</p>
                </div>
                <Button className="gap-2 rounded-xl" asChild>
                    <Link href="/dashboard/settings">
                        <Settings className="h-4 w-4" />
                        Settings
                    </Link>
                </Button>
            </div>

            {/* Profile Card */}
            <Card className="glass-card">
                <CardHeader>
                    <div className="flex items-start gap-6">
                        <Avatar className="h-24 w-24 border-4 border-primary/10">
                            {profile?.avatar_url && (
                                <AvatarImage src={profile.avatar_url} alt={displayName} />
                            )}
                            <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h2 className="text-2xl font-heading font-black">{displayName}</h2>
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="h-4 w-4" />
                                        {user.email}
                                    </div>
                                    {profile?.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            {profile.location}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        Joined {new Date(user.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {profile?.bio && (
                                <p className="text-muted-foreground leading-relaxed">
                                    {profile.bio}
                                </p>
                            )}

                            {profile?.website && (
                                <Button variant="outline" size="sm" className="gap-2 rounded-xl" asChild>
                                    <a href={profile.website} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4" />
                                        Visit Website
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card className="glass-card">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-blue-500/10 p-3">
                                <Briefcase className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-heading font-black">{resumeCount || 0}</p>
                                <p className="text-sm text-muted-foreground">Resumes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-purple-500/10 p-3">
                                <User className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-heading font-black">
                                    {portfolio?.view_count || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">Portfolio Views</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-green-500/10 p-3">
                                <ExternalLink className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-heading font-black">
                                    {portfolio ? "Active" : "Not Set"}
                                </p>
                                <p className="text-sm text-muted-foreground">Portfolio Status</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Portfolio Section */}
            {portfolio && (
                <Card className="glass-card">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Your Portfolio</CardTitle>
                                <CardDescription>
                                    Public portfolio at{" "}
                                    <a
                                        href={`/p/${portfolio.slug}`}
                                        target="_blank"
                                        className="text-primary hover:underline font-medium"
                                    >
                                        /p/{portfolio.slug}
                                    </a>
                                </CardDescription>
                            </div>
                            <Button variant="outline" className="gap-2 rounded-xl" asChild>
                                <Link href="/dashboard/portfolio">
                                    Edit Portfolio
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Badge variant={portfolio.is_public ? "default" : "secondary"}>
                                {portfolio.is_public ? "Public" : "Private"}
                            </Badge>
                            {portfolio.open_to_work && (
                                <Badge className="bg-green-500/10 text-green-600">
                                    Open to Work
                                </Badge>
                            )}
                            {portfolio.template && (
                                <Badge variant="outline">
                                    Template: {portfolio.template}
                                </Badge>
                            )}
                        </div>
                        {portfolio.tagline && (
                            <p className="text-sm text-muted-foreground">
                                {portfolio.tagline}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <Card className="glass-card bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-3">
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2 rounded-xl" asChild>
                            <Link href="/dashboard">
                                <Briefcase className="h-5 w-5" />
                                <span className="font-bold">View Resumes</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2 rounded-xl" asChild>
                            <Link href="/dashboard/portfolio">
                                <User className="h-5 w-5" />
                                <span className="font-bold">Edit Portfolio</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2 rounded-xl" asChild>
                            <Link href="/dashboard/settings">
                                <Settings className="h-5 w-5" />
                                <span className="font-bold">Account Settings</span>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
