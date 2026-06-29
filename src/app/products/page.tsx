import { ProductsExperience, type ProductFilters, type PublicProduct } from "@/components/public/products-experience";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getPublicProducts(filters: ProductFilters): Promise<PublicProduct[] | undefined> {
  try {
    const admin = createAdminClient();
    let query = admin
      .from("products")
      .select("id,name,slug,price,currency,stock,country,province,municipality,delivery_zone,warranty,promised_sla,availability,status,is_active,product_images(url),categories(name),stores(name,slug,status,is_active,country,province,municipality,delivery_zones)")
      .eq("is_active", true)
      .eq("status", "activo")
      .order("created_at", { ascending: false })
      .limit(24);

    if (filters.q?.trim()) {
      query = query.ilike("name", `%${filters.q.trim()}%`);
    }

    const { data } = await query;

    if (!data?.length) return undefined;

    const products = data.map((product) => {
      const row = product as unknown as {
        id: string;
        name: string;
        slug: string;
        price: number | string;
        currency?: string;
        stock: number | string;
        country?: string | null;
        province?: string | null;
        municipality?: string | null;
        delivery_zone?: string | null;
        warranty?: string | null;
        promised_sla?: string | null;
        availability?: string | null;
        product_images?: { url?: string } | { url?: string }[];
        categories?: { name?: string } | { name?: string }[];
        stores?: {
          name?: string;
          slug?: string;
          status?: string;
          is_active?: boolean;
          country?: string | null;
          province?: string | null;
          municipality?: string | null;
          delivery_zones?: string[];
        } | {
          name?: string;
          slug?: string;
          status?: string;
          is_active?: boolean;
          country?: string | null;
          province?: string | null;
          municipality?: string | null;
          delivery_zones?: string[];
        }[];
      };
      const image = Array.isArray(row.product_images)
        ? row.product_images[0]?.url
        : row.product_images?.url;
      const category = Array.isArray(row.categories)
        ? row.categories[0]?.name
        : row.categories?.name;
      const store = Array.isArray(row.stores) ? row.stores[0] : row.stores;
      const country = row.country || store?.country || "Cuba";
      const province = row.province || store?.province || store?.delivery_zones?.[0] || "";
      const municipality = row.municipality || store?.municipality || "";

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        currency: row.currency ?? "USD",
        stock: Number(product.stock),
        category: category ?? "Producto",
        store: store?.name ?? "Tienda VIP",
        storeSlug: store?.slug,
        country,
        province,
        municipality,
        deliveryZone: row.delivery_zone ?? store?.delivery_zones?.[0] ?? undefined,
        warranty: row.warranty ?? undefined,
        promisedSla: row.promised_sla ?? undefined,
        availability: row.availability ?? undefined,
        image: image ?? "https://images.unsplash.com/photo-1542838132-92c53300491e"
      };
    }).filter((product, index) => {
      const raw = data[index] as unknown as {
        stores?: { status?: string; is_active?: boolean } | { status?: string; is_active?: boolean }[];
      };
      const store = Array.isArray(raw.stores) ? raw.stores[0] : raw.stores;
      return product.province && product.municipality && store?.status === "activo" && store?.is_active === true;
    });

    return products.filter((product) => {
      const matchesProvince = filters.province ? product.province === filters.province : true;
      const matchesMunicipality = filters.municipality ? product.municipality === filters.municipality : true;
      const matchesCategory = filters.category ? product.category === filters.category : true;
      return matchesProvince && matchesMunicipality && matchesCategory;
    });
  } catch {
    return undefined;
  }
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<ProductFilters>;
}) {
  const filters = await searchParams;
  const products = await getPublicProducts(filters);

  return <ProductsExperience products={products} filters={filters} />;
}
