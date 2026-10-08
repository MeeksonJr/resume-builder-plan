import { redirect } from "next/navigation";

export default function UniversitySettingsRedirectPage() {
  redirect("/dashboard/settings?tab=university");
}
