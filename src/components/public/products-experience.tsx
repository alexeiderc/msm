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
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-7 md:grid-cols-[1.45fr_0.55fr] md:py-9">
          <div>
            <p className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-msm-ice">
              <ShieldCheck size={16} />
              Vendedores VIP verificados por pais, estado, provincia, ciudad y municipio
            </p>
            <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-normal text-white md:text-5xl">
              Encuentra lo que necesitas, cerca de quien lo recibe.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-msm-ice/80">
              Explora productos y servicios publicados por tiendas VIP con ubicacion, disponibilidad y tiempo de entrega visibles antes de comprar.
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
          <div className="rounded-lg border border-white/15 bg-white/10 p-4">
            <p className="text-sm font-bold">Compra con informacion clara</p>
            <div className="mt-3 grid gap-2 text-sm text-msm-ice/80">
              <span>Ubicacion y zona de entrega</span>
              <span>Tienda VIP responsable</span>
              <span>Disponibilidad y tiempo estimado</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 pb-24">
        <form action="/products" className="grid gap-3 rounded-lg border border-msm-line bg-white p-3 shadow-soft md:grid-cols-[1.2fr_0.75fr_0.75fr_0.75fr_0.75fr_auto]">
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
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-msm-blue px-4 text-sm font-bold text-white transition hover:bg-msm-navy">
            <SlidersHorizontal size={17} />
            Aplicar
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-slate-600">
          <span className="inline-flex items-center gap-2"><Filter size={16} className="text-msm-blue" /> Catalogo por tienda, zona y disponibilidad</span>
          <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-msm-blue">{filteredProducts.length} resultados</span>
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
