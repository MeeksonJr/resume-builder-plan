import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveUniversityTenant } from "@/lib/tenant/university-portal";
import { UniversityPortalView } from "@/components/portal/university-portal-view";
import { checkSchoolPortalAccess } from "@/lib/university/access-control";
import { InstitutionalAccessGate } from "@/components/portal/institutional-access-gate";

interface PortalPageProps {
  params: Promise<{ orgSlug: string }>;
}

export async function generateMetadata({ params }: PortalPageProps): Promise<Metadata> {
  const { orgSlug } = await params;
  const tenant = resolveUniversityTenant(orgSlug);

  return {
    title: `${tenant.name} | Career Center Portal | ResumeForge`,
    description: `Cohort analytics, student roster, and talent directory for ${tenant.name}.`,
  };
}

export default async function UniversityPortalPage({ params }: PortalPageProps) {
  const { orgSlug } = await params;
  const tenant = resolveUniversityTenant(orgSlug);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch student profile to verify institutional credentials
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, university_name, university_slug, school_verified, school_email, settings")
    .eq("id", user.id)
    .maybeSingle();

  // Evaluate institutional authorization
  const access = checkSchoolPortalAccess(profile, orgSlug);

  // If user is NOT verified for this specific institution, enforce the institutional gate
  if (!access.isVerified) {
    return (
      <div className="w-full mx-auto py-2 transition-all duration-300" suppressHydrationWarning>
        <InstitutionalAccessGate
          targetSlug={orgSlug}
          targetSchoolName={tenant.name}
          targetInstitution={access.targetInstitution}
          userPrimarySlug={access.userPrimarySlug}
          userPrimaryName={access.userPrimaryName}
          verifiedSchools={access.verifiedSchools}
        />
      </div>
    );
  }

  // User is verified for this institution: render full portal workspace
  return (
    <div className="w-full mx-auto py-2 transition-all duration-300" suppressHydrationWarning>
      <UniversityPortalView 
        tenant={tenant} 
        verifiedSchools={access.verifiedSchools} 
      />
    </div>
  );
}
