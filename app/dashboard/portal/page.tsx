import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CampusDirectoryView } from "@/components/portal/campus-directory-view";

export const metadata: Metadata = {
  title: "University & College Portals | ResumeForge",
  description:
    "Explore dedicated campus career centers, student cohort directories, and employer pipelines across Virginia and collegiate partner institutions.",
};

interface CampusPortalPageProps {
  searchParams: Promise<{ browse?: string }>;
}

export default async function CampusPortalHubPage({ searchParams }: CampusPortalPageProps) {
  const { browse } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch profile to check school verification status
  const { data: profile } = await supabase
    .from("profiles")
    .select("university_name, university_slug, school_verified, is_student")
    .eq("id", user.id)
    .single();

  const isVerified = Boolean(
    profile?.school_verified === true || profile?.school_verified === "true"
  );
  const schoolSlug = profile?.university_slug;
  const schoolName = profile?.university_name;

  // Auto-redirect verified students directly to their specific school portal unless they clicked "browse all"
  if (isVerified && schoolSlug && browse !== "true") {
    redirect(`/dashboard/portal/${schoolSlug}`);
  }

  return (
    <div className="w-full mx-auto px-1 py-2">
      <CampusDirectoryView 
        userSchoolSlug={schoolSlug} 
        userSchoolName={schoolName} 
        isVerified={isVerified} 
      />
    </div>
  );
}
