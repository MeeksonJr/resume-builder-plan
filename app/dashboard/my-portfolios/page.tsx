import { redirect } from "next/navigation";

export default function MyPortfoliosPageRedirect() {
  redirect("/dashboard/portfolio");
}
