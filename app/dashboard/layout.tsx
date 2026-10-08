import React from "react"
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { TopNav } from "@/components/dashboard/top-nav";
import { CommandMenu } from "@/components/dashboard/command-menu";
import { OfflineIndicatorBanner } from "@/components/pwa/offline-indicator-banner";
import { UserOnboardingDialog } from "@/components/onboarding/user-onboarding-dialog";
import { VerificationGateModal } from "@/components/auth/verification-gate-modal";
import { isAcademicDomain, detectSchoolFromEmail } from "@/lib/university/detect";

import { MobileNavDock } from "@/components/dashboard/mobile-nav-dock";

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

  // Derive isPro from either column so a stale is_pro boolean never hides Pro status
  const isPro = profile?.is_pro === true ||
    profile?.subscription_status === "active" ||
    profile?.subscription_status === "trialing";

  // ── Trial / Verification Gate ─────────────────────────────────────────────
  // Check if user's email is confirmed in Supabase auth
  const isEmailVerified = !!user.email_confirmed_at || !!user.confirmed_at;

  // If email is verified, sync it to profile (one-time catch-up)
  if (isEmailVerified && profile) {
    const updates: Record<string, any> = {};
    if (!profile.email_verified) {
      updates.email_verified = true;
      updates.is_demo_user = false;
    }

    // Auto-verify academic / school email users
    const email = user.email || "";
    const emailDomain = email.split("@")[1]?.toLowerCase().trim();
    if (isAcademicDomain(emailDomain) && !profile.school_verified) {
      const detected = detectSchoolFromEmail(email);
      updates.is_student = true;
      updates.school_verified = true;
      updates.school_email = email;
      if (!profile.university_name && detected) {
        updates.university_name = detected.name;
        updates.university_slug = detected.slug;
      }
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      Object.assign(profile, updates);
    }
  }

  const demoStartedAt: string | null = profile?.demo_trial_started_at ?? null;

  // Server-side trial check: if NOT verified AND trial expired (or never started),
  // we still render the page but pass gate=true to show the inescapable modal.
  // This means even URL-forced navigation gets the gate.
  const trialExpiredOrNeverStarted =
    !isEmailVerified &&
    (!demoStartedAt ||
      new Date(demoStartedAt).getTime() + 24 * 60 * 60 * 1000 < Date.now());

  return (
    <SidebarProvider suppressHydrationWarning>
      {/* ── Verification Gate Modal (server-validated, renders over entire layout) ── */}
      {trialExpiredOrNeverStarted && (
        <VerificationGateModal
          demoStartedAt={demoStartedAt}
          isEmailVerified={isEmailVerified}
          userEmail={user.email ?? ""}
        />
      )}

      <div suppressHydrationWarning>
        <AppSidebar user={user} profile={profile} />
      </div>
      <SidebarInset suppressHydrationWarning className="bg-background/50">
        <TopNav isPro={isPro} />
        <CommandMenu />
        <OfflineIndicatorBanner />
        <UserOnboardingDialog />
        <div suppressHydrationWarning className="flex-1 overflow-y-auto">
          <div className="w-full px-4 pt-6 pb-24 md:py-8 md:px-8 lg:px-10">
            {children}
          </div>
        </div>
        <MobileNavDock />
      </SidebarInset>
    </SidebarProvider>
  );
}
