import React from "react"
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import { CommandMenu } from "@/components/dashboard/command-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <SidebarProvider>
      <AppSidebar user={user} profile={profile} />
      <SidebarInset className="bg-background/50">
        <TopNav />
        <CommandMenu />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-10">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
