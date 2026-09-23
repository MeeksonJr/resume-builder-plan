import { redirect } from "next/navigation";

export default function AppearanceSettingsRedirectPage() {
  redirect("/dashboard/settings?tab=appearance");
}
