import { redirect } from "next/navigation";

export default function ApplicationsPageRedirect() {
  redirect("/dashboard/tracker");
}
