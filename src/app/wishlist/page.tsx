import { Heart } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { WishlistPageContent } from "@/components/wishlist/wishlist-page-content";
import { getWishlist } from "@/server/actions/wishlist";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const items = await getWishlist();

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
        <div className="flex items-center gap-2">
          <Heart size={20} className="text-msm-blue" />
          <h1 className="text-2xl font-bold">Mis favoritos</h1>
        </div>
        <div className="mt-6">
          <WishlistPageContent items={items} />
        </div>
      </section>
    </AppShell>
  );
}
