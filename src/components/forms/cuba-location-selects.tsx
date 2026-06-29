"use client";

import { useState } from "react";
import { Select } from "@/components/ui/input";
import { cubaLocations, getMunicipalitiesForProvince } from "@/lib/cuba-locations";

type CubaLocationSelectsProps = {
  provinceName?: string;
  municipalityName?: string;
  defaultProvince?: string;
  defaultMunicipality?: string;
  required?: boolean;
};

export function CubaLocationSelects({
  provinceName = "province",
  municipalityName = "municipality",
  defaultProvince = "Santiago de Cuba",
  defaultMunicipality = "Segundo Frente",
  required = false
}: CubaLocationSelectsProps) {
  const [province, setProvince] = useState(defaultProvince);
  const [municipality, setMunicipality] = useState(defaultMunicipality);
  const municipalities = getMunicipalitiesForProvince(province);

  function handleProvinceChange(nextProvince: string) {
    const nextMunicipalities = getMunicipalitiesForProvince(nextProvince);
    setProvince(nextProvince);
    setMunicipality(nextMunicipalities[0] ?? "");
  }

  return (
    <>
      <Select name={provinceName} required={required} value={province} onChange={(event) => handleProvinceChange(event.target.value)}>
        {cubaLocations.map((location) => (
          <option key={location.province} value={location.province}>
            {location.province}
          </option>
        ))}
      </Select>
      <Select
        name={municipalityName}
        required={required}
        value={municipality}
        onChange={(event) => setMunicipality(event.target.value)}
      >
        {municipalities.map((municipalityNameValue) => (
          <option key={municipalityNameValue} value={municipalityNameValue}>
            {municipalityNameValue}
          </option>
        ))}
      </Select>
    </>
  );
}
