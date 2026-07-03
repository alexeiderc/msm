export type Country = {
  code: string;
  name: string;
  flag: string;
  prefix: string;
};

export const countries: Country[] = [
  { code: "CU", name: "Cuba", flag: "🇨🇺", prefix: "+53" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸", prefix: "+1" },
  { code: "ES", name: "España", flag: "🇪🇸", prefix: "+34" },
  { code: "MX", name: "México", flag: "🇲🇽", prefix: "+52" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", prefix: "+54" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", prefix: "+57" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", prefix: "+58" },
  { code: "PE", name: "Perú", flag: "🇵🇪", prefix: "+51" },
  { code: "CL", name: "Chile", flag: "🇨🇱", prefix: "+56" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", prefix: "+593" },
  { code: "DO", name: "República Dominicana", flag: "🇩🇴", prefix: "+1" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷", prefix: "+1" },
  { code: "PA", name: "Panamá", flag: "🇵🇦", prefix: "+507" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", prefix: "+506" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹", prefix: "+502" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", prefix: "+504" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻", prefix: "+503" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮", prefix: "+505" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", prefix: "+598" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", prefix: "+595" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", prefix: "+591" },
  { code: "CA", name: "Canadá", flag: "🇨🇦", prefix: "+1" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧", prefix: "+44" },
  { code: "DE", name: "Alemania", flag: "🇩🇪", prefix: "+49" },
  { code: "FR", name: "Francia", flag: "🇫🇷", prefix: "+33" },
  { code: "IT", name: "Italia", flag: "🇮🇹", prefix: "+39" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", prefix: "+351" },
];

export function getCountryByCode(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}

export function getCountryByPrefix(prefix: string): Country | undefined {
  return countries.find((c) => c.prefix === prefix);
}
