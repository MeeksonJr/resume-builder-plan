import { Metadata } from "next";
import { resolveUniversityTenant } from "@/lib/tenant/university-portal";
import { UniversityPortalView } from "@/components/portal/university-portal-view";

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

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <UniversityPortalView tenant={tenant} />
    </div>
  );
}
