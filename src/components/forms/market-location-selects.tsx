"use client";

import { useState } from "react";
import { Select } from "@/components/ui/input";
import { getLocalitiesForRegion, getMarketCountry, getRegionsForCountry, marketCountries } from "@/lib/geo-locations";

type MarketLocationSelectsProps = {
  countryName?: string;
  provinceName?: string;
  municipalityName?: string;
  defaultCountry?: string;
  defaultProvince?: string;
  defaultMunicipality?: string;
  required?: boolean;
};

export function MarketLocationSelects({
  countryName = "country",
  provinceName = "province",
  municipalityName = "municipality",
  defaultCountry = "Cuba",
  defaultProvince = "Santiago de Cuba",
  defaultMunicipality = "Segundo Frente",
  required = false
}: MarketLocationSelectsProps) {
  const [country, setCountry] = useState(defaultCountry);
  const [province, setProvince] = useState(defaultProvince);
  const [municipality, setMunicipality] = useState(defaultMunicipality);
  const activeCountry = getMarketCountry(country);
  const regions = getRegionsForCountry(country);
  const localities = province ? getLocalitiesForRegion(country, province) : [];

  function handleCountryChange(nextCountry: string) {
    const nextRegions = getRegionsForCountry(nextCountry);
    const nextProvince = nextRegions[0] ?? "";
    const nextLocalities = getLocalitiesForRegion(nextCountry, nextProvince);
    setCountry(nextCountry);
    setProvince(nextProvince);
    setMunicipality(nextLocalities[0] ?? "");
  }

  function handleProvinceChange(nextProvince: string) {
    const nextLocalities = getLocalitiesForRegion(country, nextProvince);
    setProvince(nextProvince);
    setMunicipality(nextLocalities[0] ?? "");
  }

  return (
    <>
      <Select name={countryName} required={required} value={country} onChange={(event) => handleCountryChange(event.target.value)}>
        {marketCountries.map((countryOption) => (
          <option key={countryOption.code} value={countryOption.name}>
            {countryOption.name}
          </option>
        ))}
      </Select>
      <Select name={provinceName} required={required} value={province} onChange={(event) => handleProvinceChange(event.target.value)}>
        <option value="">{activeCountry.regionLabel}</option>
        {regions.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </Select>
      <Select
        name={municipalityName}
        required={required}
        value={municipality}
        onChange={(event) => setMunicipality(event.target.value)}
      >
        <option value="">{activeCountry.localityLabel}</option>
        {localities.map((locality) => (
          <option key={locality} value={locality}>
            {locality}
          </option>
        ))}
      </Select>
    </>
  );
}
