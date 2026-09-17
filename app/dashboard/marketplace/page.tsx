import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TalentMarketplaceView } from "@/components/dashboard/marketplace/talent-marketplace-view";

export default async function MarketplacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-full bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <TalentMarketplaceView />
      </div>
    </div>
  );
}
