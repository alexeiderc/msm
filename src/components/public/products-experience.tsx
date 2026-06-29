"use client";

import Link from "next/link";
import { useState } from "react";
import { Filter, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/ui/shell";
import { Input, Select } from "@/components/ui/input";
import { ProductCard } from "@/components/marketplace/product-card";
import { EmptyState } from "@/components/ui/state";
import { getLocalitiesForRegion, getMarketCountry, getRegionsForCountry, marketCountries } from "@/lib/geo-locations";
import { fallbackPublicProducts } from "@/lib/public-products";

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency?: string;
  stock: number;
  category: string;
  store: string;
  country?: string;
  province: string;
  municipality?: string;
  deliveryZone?: string;
  warranty?: string;
  promisedSla?: string;
  availability?: string;
  storeSlug?: string;
  image: string;
};

export type ProductFilters = {
  q?: string;
  country?: string;
  province?: string;
  municipality?: string;
  category?: string;
};

export function ProductsExperience({
  products = fallbackPublicProducts,
  filters = {}
}: {
  products?: PublicProduct[];
  filters?: ProductFilters;
}) {
  const [selectedCountry, setSelectedCountry] = useState(filters.country ?? "");
  const [selectedProvince, setSelectedProvince] = useState(filters.province ?? "");
  const [selectedMunicipality, setSelectedMunicipality] = useState(filters.municipality ?? "");
  const activeCountry = getMarketCountry(selectedCountry || "Cuba");
  const provinceOptions = getRegionsForCountry(selectedCountry || activeCountry.name);
  const municipalityOptions = selectedProvince ? getLocalitiesForRegion(selectedCountry || activeCountry.name, selectedProvince) : [];

  const filteredProducts = products.filter((product) => {
    const query = filters.q?.trim().toLowerCase();
    const productCountry = product.country ?? "Cuba";
    const matchesQuery = query
      ? [product.name, product.store, product.category, productCountry, product.province, product.municipality ?? ""].some((value) =>
          value.toLowerCase().includes(query)
        )
      : true;
    const matchesCountry = filters.country ? productCountry === filters.country : true;
    const matchesProvince = filters.province ? product.province === filters.province : true;
    const matchesMunicipality = filters.municipality ? product.municipality === filters.municipality : true;
    const matchesCategory = filters.category ? product.category === filters.category : true;

    return matchesQuery && matchesCountry && matchesProvince && matchesMunicipality && matchesCategory;
  });
  const categories = Array.from(new Set(products.map((product) => product.category))).sort();

  return (
    <AppShell>
      <section className="border-b border-white/10 bg-msm-midnight text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[1.4fr_0.6fr] md:py-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-msm-ice">
              <ShieldCheck size={16} />
              Vendedores VIP verificados por pais, estado, provincia, ciudad y municipio
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-normal text-white md:text-5xl">
              Productos y servicios MSM my store con pagos, ordenes y entregas auditadas.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-msm-ice/80">
              Compra en Cuba, Estados Unidos y futuros mercados. MSM my store centraliza el cobro,
              la orden, el comprobante, la evidencia, el soporte y la confianza; el VIP entrega o
              atiende localmente por zona.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/checkout"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-msm-blue px-4 text-sm font-semibold text-white shadow-glow"
              >
                Iniciar compra
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white"
              >
                Como funciona
              </Link>
            </div>
          </div>
          <div className="msm-luminous-panel rounded-lg p-4">
            <p className="text-sm font-bold">Flujo controlado por MSM</p>
            <div className="mt-3 grid gap-2 text-sm text-msm-ice/80">
              <span>1. Comprador paga en MSM my store</span>
              <span>2. Economia valida comprobante y cuenta asignada</span>
              <span>3. VIP entrega con evidencia y cierre auditable</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
        <form action="/products" className="grid gap-3 rounded-lg border border-msm-line bg-white p-3 md:grid-cols-[1.2fr_0.75fr_0.75fr_0.75fr_0.75fr_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <Input
              name="q"
              className="pl-10"
              placeholder="Buscar productos, ciudades, tiendas o servicios"
              defaultValue={filters.q ?? ""}
            />
          </label>
          <Select
            name="country"
            value={selectedCountry}
            onChange={(event) => {
              setSelectedCountry(event.target.value);
              setSelectedProvince("");
              setSelectedMunicipality("");
            }}
          >
            <option value="">Todos los paises</option>
            {marketCountries.map((country) => (
              <option key={country.code} value={country.name}>{country.name}</option>
            ))}
          </Select>
          <Select
            name="province"
            value={selectedProvince}
            onChange={(event) => {
              setSelectedProvince(event.target.value);
              setSelectedMunicipality("");
            }}
          >
            <option value="">Todo {activeCountry.regionLabel.toLowerCase()}</option>
            {provinceOptions.map((province) => (
              <option key={province} value={province}>{province}</option>
            ))}
          </Select>
          <Select
            name="municipality"
            value={selectedMunicipality}
            onChange={(event) => setSelectedMunicipality(event.target.value)}
            disabled={!selectedProvince}
          >
            <option value="">{selectedProvince ? `Todo ${activeCountry.localityLabel.toLowerCase()}` : `Elige ${activeCountry.regionLabel.toLowerCase()}`}</option>
            {municipalityOptions.map((municipality) => (
              <option key={municipality} value={municipality}>{municipality}</option>
            ))}
          </Select>
          <Select name="category" defaultValue={filters.category ?? ""}>
            <option value="">Todas las categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-msm-line px-4 text-sm font-semibold text-slate-600">
            <SlidersHorizontal size={17} />
            Aplicar
          </button>
        </form>

        <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Filter size={16} />
          Tiendas activas, productos revisables, servicios VIP y stock controlado por pais y zona
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {!filteredProducts.length ? (
          <div className="mt-6">
            <EmptyState title="No encontramos productos" detail="Ajusta municipio, categoria o busca otra palabra." />
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
