import { redirect } from "next/navigation";

export default function AgentPageRedirect() {
  redirect("/dashboard/swarm");
}
